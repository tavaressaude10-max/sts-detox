$ErrorActionPreference = 'Stop'
$OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$userName = Read-Host 'Usuario MySQL exclusivo de u897433725_sts_homologa'
$password = Read-Host 'Senha MySQL de homologacao' -AsSecureString
$key = Read-Host 'Chave de criptografia exclusiva de homologacao' -AsSecureString
try {
    @{
        user = $userName
        password = [Net.NetworkCredential]::new('', $password).Password
        key = [Net.NetworkCredential]::new('', $key).Password
    } | ConvertTo-Json -Compress | & node (Join-Path $PSScriptRoot 'validar-homologacao.mjs')
    exit $LASTEXITCODE
} finally {
    $password.Dispose()
    $key.Dispose()
}
