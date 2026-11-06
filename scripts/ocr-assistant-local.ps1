param([string]$ImageFolder, [int]$Limit = 0)
# OCR nativo do Windows, local; não usa serviço externo nem altera o PDF.
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Length -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await-WinRT($Operation, $ResultType) {
    $task = $asTask.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
    $task.Wait()
    $task.Result
}
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) { throw 'Nenhum idioma OCR local instalado.' }
Write-Output ('OCR language: ' + $engine.RecognizerLanguage.LanguageTag)
$images = @(Get-ChildItem -LiteralPath $ImageFolder -Filter '*.png')
if ($Limit -gt 0) { $images = @($images | Select-Object -First $Limit) }
foreach ($image in $images) {
    $destination = $image.FullName + '.ocr.json'
    if (Test-Path -LiteralPath $destination) { continue }
    try {
        $file = Await-WinRT ([Windows.Storage.StorageFile]::GetFileFromPathAsync($image.FullName)) ([Windows.Storage.StorageFile])
        $stream = Await-WinRT ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
        $decoder = Await-WinRT ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
        $bitmap = Await-WinRT ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
        $result = Await-WinRT ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
        $lines = @($result.Lines | ForEach-Object { $_.Text })
        @{ engine='Windows.Media.Ocr'; language=$engine.RecognizerLanguage.LanguageTag; text=($lines -join "`n"); reviewed=$false } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $destination -Encoding UTF8
        $bitmap.Dispose(); $stream.Dispose()
        Write-Output $image.Name
    } catch { Write-Warning ($image.Name + ': ' + $_.Exception.ToString()) }
}
