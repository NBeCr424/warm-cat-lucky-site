$port = 5500
$root = "f:\VScode"
$indexFile = Join-Path $root "index.html"

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Output "Serving at http://0.0.0.0:$port/"

function Write-HttpResponse {
  param(
    [Parameter(Mandatory = $true)] [System.Net.Sockets.NetworkStream] $Stream,
    [Parameter(Mandatory = $true)] [int] $StatusCode,
    [Parameter(Mandatory = $true)] [string] $StatusText,
    [Parameter(Mandatory = $true)] [byte[]] $BodyBytes,
    [Parameter(Mandatory = $true)] [string] $ContentType
  )

  $header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($BodyBytes.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($BodyBytes.Length -gt 0) {
    $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  }
}

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $requestLine = $reader.ReadLine()
    if ([string]::IsNullOrWhiteSpace($requestLine)) {
      continue
    }

    while ($reader.Peek() -ge 0) {
      $line = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($line)) {
        break
      }
    }

    $parts = $requestLine.Split(" ")
    $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
    $path = ($rawPath -split "\?")[0]

    if ($path -eq "/" -or $path -eq "/index.html") {
      if (Test-Path $indexFile) {
        $bytes = [System.IO.File]::ReadAllBytes($indexFile)
        Write-HttpResponse -Stream $stream -StatusCode 200 -StatusText "OK" -BodyBytes $bytes -ContentType "text/html; charset=utf-8"
      } else {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("index.html not found")
        Write-HttpResponse -Stream $stream -StatusCode 404 -StatusText "Not Found" -BodyBytes $bytes -ContentType "text/plain; charset=utf-8"
      }
    } elseif ($path -eq "/favicon.ico") {
      Write-HttpResponse -Stream $stream -StatusCode 204 -StatusText "No Content" -BodyBytes ([byte[]]@()) -ContentType "image/x-icon"
    } else {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
      Write-HttpResponse -Stream $stream -StatusCode 404 -StatusText "Not Found" -BodyBytes $bytes -ContentType "text/plain; charset=utf-8"
    }
  } catch {
    try {
      if ($null -ne $stream) {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error")
        Write-HttpResponse -Stream $stream -StatusCode 500 -StatusText "Internal Server Error" -BodyBytes $bytes -ContentType "text/plain; charset=utf-8"
      }
    } catch {
    }
  } finally {
    if ($null -ne $reader) { $reader.Dispose() }
    if ($null -ne $stream) { $stream.Dispose() }
    $client.Close()
  }
}
