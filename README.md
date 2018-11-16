# Mock Provider

Mock OAuth provider for [Bond](https://github.com/DataBiosphere/bond).

## Endpoints

The following endpoints are required.

### OpenId Well-Known URI

Needed so that Bond knows which urls to call during the OAuth dance.

#### Implementation

A publicly accessible object in a Google Bucket.

### Authorize

The starting point of the OAuth dance.  This is the endpoint that will "authenticate" and "authorize" the
user and redirect the user back to the specified `redirect_uri` with an "access code" that will be used by Bond in the
next step of the OAuth dance.

#### Implementation

Implemented as a Google Cloud Function because it needs to generate a URL and respond with a redirect.  Simply responds 
with a redirect to the specified `redirect_uri` with a randomly generated `code` param in addition to the provided 
`state` param. 

**Request Method** - `GET`

**Request Params** - The following parameters are the only ones that matter to this endpoint.  Any other passed params 
will be ignored.

| Name         | Encoding | Description                                                                                                                |
|--------------|----------|----------------------------------------------------------------------------------------------------------------------------|
| redirect_uri | url      | URI that will be redirected to upon successful authentication and authorization.                                           |
| state        | base64   | Encoded string representing arbitrary state information.  Will be returned unchanged as a query param on the redirect uri. |

**Response Code** - `302`

**Redirect URI** -

URL Decoded value of the `redirect_uri` param that came in on the request.  Should additionally include the following 
query params:

| Name  | Encoding | Description                                                                        |
|-------|----------|------------------------------------------------------------------------------------|
| code  | none     | A random access code that will be posted back in the next step of the oauth dance. |
| state | base64   | The same value as the `state` param that came in on the request.                   |

_Note:_ The `redirect_uri` may have a [Fragment Identifier](https://en.wikipedia.org/wiki/Fragment_identifier) in which 
case you will need to properly construct the new URI with the query params and fragment in the 
[correct locations](https://en.wikipedia.org/wiki/URL#Syntax).

### Exchange Access Code

After the client service is redirected to, it needs to take the `code` param from above response and `POST`
that back to this OAuth provider in order to obtain a "token response object".

#### Implementation

Implement as a Google Cloud Function because it needs to accept a `POST` request and must be an HTTPS url, but 
otherwise it can just regurgitate a static "token response object" that we pull from a Google Bucket or something.

**Request Method** - `POST`

**Request Params** - The following parameters are the only ones that matter to this endpoint.  Any other passed params 
will be ignored.

| Name       | Encoding | Value              | Description                                                                            |
|------------|----------|--------------------|----------------------------------------------------------------------------------------|
| grant_type | none     | authorization_code | Tells the endpoint whether we are exchanging an authorization_code or a refresh_token. |

**Response Code** - `200`

**Response Body** - JSON formatted "token response object".

### Generate Access Token

Clients that have a Refresh Token can `POST` it back to this endpoint to generate a new Access Token. 

#### Implementation

Implement as a Google Cloud Function because it needs to accept a `POST` request and must be an HTTPS url, but 
otherwise it can just regurgitate a static "token response object" that we pull from a Google Bucket or something.

**Request Method** - `POST`

**Request Params** - The following parameters are the only ones that matter to this endpoint.  Any other passed params 
will be ignored.

| Name       | Encoding | Value         | Description                                                                            |
|------------|----------|---------------|----------------------------------------------------------------------------------------|
| grant_type | none     | refresh_token | Tells the endpoint whether we are exchanging an authorization_code or a refresh_token. |

_Note:_ For this endpoint and "Exchange Access Code", we may not need to specify the `grant_type` parameter at all if we 
can just return a static "token response object".  This would work because Bond extracts the same URL out of the OpenId 
Well-Known URI data for both of these endpoints and just posts different body data based on which action it is trying to
perform.  This would not work if we actually want to grant access to anything using this mock service, which we probably
don't.

**Response Code** - `200`

**Response Body** - JSON formatted "token response object".

### Revoke Access

We are not implementing an endpoint for revoking access because there is no real functionality that calls this endpoint
in Bond yet.

## Service Account Vending

In addition to performing the OAuth dance, Bond also relies on its providers to be able to generate/distribute JSON 
formatted Google Service Account Keys.  

### Get Service Account Key

Bond config will specify a `FENCE_BASE_URL` and the path that it calls to get a Service Account Key from the provider 
is:

`{FENCE_BASE_URL}/user/credentials/google`

#### Implementation

Implement as a Google Cloud Function because it needs to accept a `POST` request, but otherwise it can just regurgitate
a static JSON Service Account Key that we pull from a Google Bucket or something.

**Request Method** - `POST`

**Request Params** - None

**Response Code** - `200`

**Response Body** - JSON Service Account Key.

_NOTE:_ This Service Account Key may need to be a real key because Bond's `getServiceAccountAccessToken` endpoint uses
this key and Google libs to generate an Access Token for this key.