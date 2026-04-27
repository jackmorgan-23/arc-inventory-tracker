create_alert() {
  local NAME=$1
  local FILTER=$2

  cat <<EOF > alert-policy.json
{
  "displayName": "$NAME",
  "conditions": [
    {
      "displayName": "Log match condition",
      "conditionMatchedLog": {
        "filter": "$FILTER"
      }
    }
  ],
  "notificationChannels": [
    "$CHANNEL_NAME"
  ],
  "alertStrategy": {
    "notificationRateLimit": {
      "period": "86400s"
    }
  }
}
EOF

  gcloud alpha monitoring policies create --policy-from-file=alert-policy.json
  rm alert-policy.json
}