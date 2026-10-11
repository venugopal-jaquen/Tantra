param(
  [Parameter(Mandatory = $true)][string]$HeroTurnaround,
  [Parameter(Mandatory = $true)][string]$AsuraTurnaround,
  [string]$OutputRoot = ''
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
  $OutputRoot = Join-Path $PSScriptRoot '..\game\assets\chars\well-delver-v1'
}

$OutputRoot = [System.IO.Path]::GetFullPath($OutputRoot)
$SourceRoot = Join-Path $OutputRoot 'source'
New-Item -ItemType Directory -Force -Path $OutputRoot, $SourceRoot | Out-Null

function Get-AlphaBounds([System.Drawing.Bitmap]$Bitmap, [System.Drawing.Rectangle]$Area) {
  $minX = $Area.Right; $minY = $Area.Bottom; $maxX = -1; $maxY = -1
  for ($y = $Area.Top; $y -lt $Area.Bottom; $y++) {
    for ($x = $Area.Left; $x -lt $Area.Right; $x++) {
      if ($Bitmap.GetPixel($x, $y).A -gt 24) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt $minX -or $maxY -lt $minY) { throw "No visible pixels in $Area" }
  $pad = [Math]::Ceiling([Math]::Max($maxX - $minX + 1, $maxY - $minY + 1) * 0.04)
  $left = [Math]::Max($Area.Left, $minX - $pad)
  $top = [Math]::Max($Area.Top, $minY - $pad)
  $right = [Math]::Min($Area.Right, $maxX + $pad + 1)
  $bottom = [Math]::Min($Area.Bottom, $maxY + $pad + 1)
  return [System.Drawing.Rectangle]::FromLTRB($left, $top, $right, $bottom)
}

function New-Frame([System.Drawing.Bitmap]$Source, [System.Drawing.Rectangle]$Crop, [int]$Size, [bool]$Flip) {
  $out = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $slice = $Source.Clone($Crop, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  if ($Flip) { $slice.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
  $scale = [Math]::Min(($Size - 8.0) / $slice.Width, ($Size - 6.0) / $slice.Height)
  $w = [Math]::Round($slice.Width * $scale); $h = [Math]::Round($slice.Height * $scale)
  $x = [Math]::Round(($Size - $w) / 2.0); $y = $Size - 3 - $h
  $g.DrawImage($slice, [System.Drawing.Rectangle]::new($x, $y, $w, $h))
  $slice.Dispose(); $g.Dispose()
  return $out
}

function Save-Png([System.Drawing.Bitmap]$Bitmap, [string]$Path) {
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Bitmap.Dispose()
}

function Build-Character([string]$Name, [string]$SourcePath) {
  Copy-Item -LiteralPath $SourcePath -Destination (Join-Path $SourceRoot "$Name-turnaround.png") -Force
  $turn = [System.Drawing.Bitmap]::FromFile($SourcePath)
  try {
    # The generated turnaround is three equal columns: front, back, right.  The left view
    # is the right view mirrored, matching the game's established sprite convention.
    $third = [Math]::Floor($turn.Width / 3)
    $views = @{
      front = [System.Drawing.Rectangle]::new(0, 0, $third, $turn.Height)
      back = [System.Drawing.Rectangle]::new($third, 0, $third, $turn.Height)
      right = [System.Drawing.Rectangle]::new($third * 2, 0, $turn.Width - ($third * 2), $turn.Height)
    }
    $frames = @{}
    foreach ($facing in @('front', 'back', 'right')) {
      $frame = New-Frame $turn (Get-AlphaBounds $turn $views[$facing]) 96 $false
      $path = Join-Path $OutputRoot "$Name-$facing.png"
      $frame.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
      $frames[$facing] = [System.Drawing.Bitmap]::FromFile($path)
    }
    $left = New-Frame $turn (Get-AlphaBounds $turn $views.right) 96 $true
    $leftPath = Join-Path $OutputRoot "$Name-left.png"
    $left.Save($leftPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $frames.left = [System.Drawing.Bitmap]::FromFile($leftPath)

    # Phaser expects 4 rows (front, back, left, right) and 9 cells per row.  Until a
    # hand-animated cycle replaces it, this is a deliberately modest walk: a weight shift,
    # vertical bob and small lateral sway.  It is visually stable at phone scale and keeps
    # the asset contract complete without pretending it is a final limb animation.
    $cell = 112; $count = 9
    $sheet = [System.Drawing.Bitmap]::new($cell * $count, $cell * 4, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($sheet)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $lift = @(0, -1, -2, -1, 0, -1, -2, -1, 0)
    $sway = @(0, 1, 1, 0, -1, -1, 0, 1, 0)
    $squash = @(1.00, 0.98, 0.96, 0.98, 1.00, 0.98, 0.96, 0.98, 1.00)
    $row = 0
    foreach ($facing in @('front', 'back', 'left', 'right')) {
      for ($i = 0; $i -lt $count; $i++) {
        $source = $frames[$facing]
        $scaleY = $squash[$i]; $scaleX = 2 - $scaleY
        $w = [Math]::Round(96 * $scaleX); $h = [Math]::Round(96 * $scaleY)
        $x = $i * $cell + [Math]::Round(($cell - $w) / 2.0) + $sway[$i]
        $y = $row * $cell + 13 + $lift[$i] + (96 - $h)
        $g.DrawImage($source, [System.Drawing.Rectangle]::new($x, $y, $w, $h))
      }
      $row++
    }
    $g.Dispose()
    $sheet.Save((Join-Path $OutputRoot "$Name-walk.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $sheet.Dispose()
    $frames.Values | ForEach-Object { $_.Dispose() }
  } finally {
    $turn.Dispose()
  }
}

Build-Character 'wellhero' $HeroTurnaround
Build-Character 'wellasura' $AsuraTurnaround
Write-Host "Built directional stills and walk sheets in $OutputRoot"
