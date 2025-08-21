param(
  [Parameter(Mandatory=$true)][string]$ExpectedSha,
  [switch]$RunChecks
)

$Params = @("--expectedSha=4d450f668c5b63f9d2270968abbafc353b460c47")
if ($RunChecks) { $Params += "--runChecks=1" }

node "scripts/applyHelpers/applyFiles.mjs" $Params
