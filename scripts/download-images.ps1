$productsPath = "C:\Users\Alexander Stenemalm\bastavansen\lib\products.js"
$outputDir = "C:\Users\Alexander Stenemalm\bastavansen\public\images\products"

# Extract all image URLs from products.js
$content = Get-Content $productsPath -Raw
$allUrls = [regex]::Matches($content, 'https://[^\s"]+\.(?:jpg|png|webp|jpeg)') | ForEach-Object { $_.Value } | Sort-Object -Unique

Write-Host "Hittade $($allUrls.Count) unika bild-URLer"

$ok = 0; $skip = 0; $fail = 0
foreach ($url in $allUrls) {
    $filename = [System.IO.Path]::GetFileName(($url -split '\?')[0])
    $outPath = Join-Path $outputDir $filename
    if (Test-Path $outPath) { $skip++; continue }
    try {
        $wr = [System.Net.WebRequest]::Create($url)
        $wr.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"
        $wr.Timeout = 15000
        $resp = $wr.GetResponse()
        $stream = $resp.GetResponseStream()
        $fs = [System.IO.File]::Create($outPath)
        $stream.CopyTo($fs)
        $fs.Close(); $stream.Close(); $resp.Close()
        $ok++
        if ($ok % 50 -eq 0) { Write-Host "  $ok nedladdade..." }
    } catch {
        $fail++
    }
}
Write-Host "Klar: $ok nedladdade, $skip redan finns, $fail misslyckade"
