$root = 'd:\workbuddy\accout'
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
Write-Host 'Server on http://localhost:8080'
$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.js'='application/javascript; charset=utf-8'; '.png'='image/png';
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml';
  '.ico'='image/x-icon'; '.json'='application/json'; '.woff2'='font/woff2'
}
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = $ctx.Request.Url.AbsolutePath.TrimStart('/')
  if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }
  $file = Join-Path $root ($path -replace '/', '\')
  if ((Test-Path $file -PathType Leaf)) {
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
    $b = [Text.Encoding]::UTF8.GetBytes('Not Found')
    $ctx.Response.OutputStream.Write($b, 0, $b.Length)
  }
  $ctx.Response.Close()
}
