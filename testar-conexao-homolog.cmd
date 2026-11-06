@echo off
setlocal
echo Teste de conexao MySQL - homologacao
echo Usuario: u897433725_sts_homolog
echo Digite a senha MySQL apenas no prompt do cliente remoto. Ela nao aparece na tela.
ssh.exe -F NUL -tt -o BatchMode=yes -o StrictHostKeyChecking=yes -o UpdateHostKeys=no -o ForwardAgent=no -o IdentitiesOnly=yes -o ConnectTimeout=10 -i "%USERPROFILE%\.ssh\stsdetox_homologacao" -p 65002 u897433725@82.180.153.59 "mysql --no-defaults --protocol=TCP --host=127.0.0.1 --port=3306 --connect-timeout=10 --user=u897433725_sts_homolog --database=u897433725_sts_homologa --password --execute=quit"
set "rc=%errorlevel%"
set "resultado=Conexao nao confirmada. Confira a mensagem acima."
if "%rc%"=="255" set "resultado=Falha no SSH. Autenticacao MySQL nao confirmada."
if "%rc%"=="0" set "resultado=Autenticacao MySQL e acesso ao banco de homologacao confirmados."
echo %resultado%
>>"%~dp0teste-conexao-homolog.log" echo %date% %time% - %resultado% Codigo: %rc%
pause
exit /b %rc%
