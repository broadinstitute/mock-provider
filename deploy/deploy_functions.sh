#!/usr/bin/env bash
set -x

gcloud functions deploy authorize --runtime nodejs8 --trigger-http
gcloud functions deploy token --runtime nodejs8 --trigger-http