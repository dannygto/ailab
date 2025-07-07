# Execute command on remote development machine
param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

Write-Host "Executing command on remote machine: $Command" -ForegroundColor Cyan
ssh aicam-remote "$Command"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Command executed successfully!" -ForegroundColor Green
} else {
    Write-Host "Command execution failed with code: $LASTEXITCODE" -ForegroundColor Red
}
