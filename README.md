# Mock Provider

Mock OAuth provider for [Bond](https://github.com/DataBiosphere/bond).

## Endpoints

The following endpoints are required.

### OpenId Well-Known URI

Needed so that Bond knows which urls to call during the OAuth dance.

#### Implementation

A publicly accessible object in a Google Bucket.

**Path** - `/user/.well-known/openid-configuration`

**Request Method** - `GET`


### Authorize

The starting point of the OAuth dance.  This is the endpoint that will authenticate and authorize the
user and redirect the user back to the specified `redirect_uri` with an "access code" that will be used by Bond in the
next step of the OAuth dance.  For this service, there is no authentication or authorization that will take place so it
should just return immediately.

#### Implementation

Implemented as a Google Cloud Function because it needs to generate a URL and respond with a redirect.  Simply responds 
with a redirect to the specified `redirect_uri` with a randomly generated `code` param in addition to the provided 
`state` param. 

**Path** - `/authorize` (additional values on the path are ignored)

**Request Method** - `GET`

**Request Params** - The following parameters are the only ones that matter to this endpoint.  Any other passed params 
will be ignored.

| Name         | Encoding | Description                                                                                                                |
|--------------|----------|----------------------------------------------------------------------------------------------------------------------------|
| redirect_uri | url      | URI that will be redirected to upon successful authentication and authorization.                                           |
| state        | base64   | Encoded string representing arbitrary state information.  Will be returned unchanged as a query param on the redirect uri. |

**Response Code** - `303`

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

**Path** - `/token` (additional values on the path are ignored)

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

**Path** - `/user/oauth2/token` (additional values on the path are ignored)

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

Revoke a refresh token so that it cannot be used to generate new access tokens

#### Implementation

Implement as a Google Cloud Function because it needs to accept a `POST` request and must be an HTTPS url.

**Path** - `/user/oauth2/token` (additional values on the path are ignored)

**Request Method** - `POST`

**Request Body** - A JSON object of the form `{"token": "any-non-empty-string"}` or form data with a 
`token: non-empty-string` entry

**Response Code** - `204`


### Delete Google Credentials

Delete Google credentials on the provider so that the user is "logged out" of the provider

#### Implementation

Implement as a Google Cloud Function because it needs to accept a `DELETE` request and must be an HTTPS url.

**Path** - `/user/credentials/google` (additional values on the path are ignored)

**Request Method** - `DELETE`

**Response Code** - `204`


## Service Account Vending

In addition to performing the OAuth dance, Bond also relies on its providers to be able to generate/distribute JSON 
formatted Google Service Account Keys.  

### Get Service Account Key

Bond config will specify a `FENCE_BASE_URL` and the path that it calls to get a Service Account Key from the provider 
is:

`{FENCE_BASE_URL}/user/credentials/google`

The Service Account Key JSON will be stored in a publicly accessible Google Bucket (Read-only).  Therefore, it is 
essential that this Service Account have no other permissions than the ability to read protected objects from wherever
we store test DOS resolution objects.

#### Implementation

Implement as a Google Cloud Function because it needs to accept a `POST` request, but otherwise it can just regurgitate
a static JSON Service Account Key that we pull from a Google Bucket or something.

**Path** - `/user/oauth2/token` (additional values on the path are ignored)

**Request Method** - `POST`

**Request Params** - None

**Request Body** - None

**Response Code** - `200`

**Response Body** - JSON Service Account Key.
