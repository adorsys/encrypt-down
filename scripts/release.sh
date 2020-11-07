curl -v -H "Accept: application/vnd.github.everest-preview+json" \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  https://api.github.com/repos/adorsys/encrypt-down/dispatches -d '{ "event_type": "semantic-release" }'
