#!/usr/bin/env bash
set -x

for cloud_fn in "authorize" "token" "key"; do
    gcloud functions deploy ${cloud_fn} --runtime nodejs8 --trigger-http
done