param(
    [string]$OutputDirectory = ''
)

# 输出目录由脚本参数指定；默认子目录、命名前缀和压缩方式在此配置
$DefaultOutputFolder = 'releases'
$PackagePrefix = 'SDU-BreadBoard-v'
$CompressionLevel = 'Optimal'
$DuplicateSuffixLength = 8
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
# 需要放入离线包的运行文件和资料目录
$PackageFiles = @('index.html', 'application.js', 'styles', 'vendor', 'assets', 'examples', 'docs', 'README.md', 'LICENSE')

# 确保待操作路径位于指定目录内，参数为目标和父目录，没有返回值
function Confirm-ChildPath {
    param(
        [string]$TargetPath,
        [string]$ParentPath
    )
    $absoluteTarget = [System.IO.Path]::GetFullPath($TargetPath)
    $absoluteParent = [System.IO.Path]::GetFullPath($ParentPath)
    $prefix = $absoluteParent.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    if (!$absoluteTarget.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw '目标路径超出了打包目录，请检查路径设置'
    }
}

# 收集运行文件并生成 ZIP，自动清理本次打包使用的临时目录
function New-OfflinePackage {
    $metadataPath = Join-Path $ProjectRoot 'package.json'
    $metadataText = Get-Content -LiteralPath $metadataPath -Raw -Encoding UTF8
    $metadata = ConvertFrom-Json -InputObject $metadataText
    $version = [string]$metadata.version
    if ($version -notmatch '^\d+\.\d+\.\d+$') {
        throw '版本号格式应为数字，例如 1.0.5'
    }

    foreach ($name in $PackageFiles) {
        $source = Join-Path $ProjectRoot $name
        if (!(Test-Path -LiteralPath $source)) {
            throw ('缺少运行文件：' + $name + '。请下载完整的项目文件')
        }
    }

    $output = $OutputDirectory
    if ($output -eq '') {
        $output = Join-Path $ProjectRoot $DefaultOutputFolder
    }
    $output = [System.IO.Path]::GetFullPath($output)
    New-Item -ItemType Directory -Path $output -Force | Out-Null
    $temporaryName = '.package-' + [System.Guid]::NewGuid().ToString('N')
    $temporaryRoot = Join-Path $output $temporaryName
    Confirm-ChildPath -TargetPath $temporaryRoot -ParentPath $output
    $packageName = $PackagePrefix + $version
    $packageRoot = Join-Path $temporaryRoot $packageName
    $archive = Join-Path $output ($packageName + '-offline.zip')
    Confirm-ChildPath -TargetPath $archive -ParentPath $output
    if (Test-Path -LiteralPath $archive) {
        $identifier = [System.Guid]::NewGuid()
        $identifierText = $identifier.ToString('N')
        $suffix = $identifierText.Substring(0, $DuplicateSuffixLength)
        $archive = Join-Path $output ($packageName + '-offline-' + $suffix + '.zip')
        Confirm-ChildPath -TargetPath $archive -ParentPath $output
    }

    try {
        New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
        foreach ($name in $PackageFiles) {
            $source = Join-Path $ProjectRoot $name
            Copy-Item -LiteralPath $source -Destination $packageRoot -Recurse
        }

        # 说明文件与入口放在一起，游客解压后即可找到打开方式
        $instructions = @('# SDU 面包板离线包', '', '完整解压后，使用 Chrome 或 Edge 打开 index.html', '', '离线包已包含运行所需的文件，请保留 styles、vendor、assets 等目录', '', '当你按 Ctrl+S 后，程序只保存当前实验；迁移实验时可逐份导出 JSON，再到新页面导入')
        $instructionsPath = Join-Path $packageRoot 'START-HERE.md'
        Set-Content -LiteralPath $instructionsPath -Value $instructions -Encoding UTF8
        Compress-Archive -LiteralPath $packageRoot -DestinationPath $archive -CompressionLevel $CompressionLevel
        Write-Output ('离线包：' + $archive)
        return $archive
    }
    finally {
        if (Test-Path -LiteralPath $temporaryRoot) {
            Confirm-ChildPath -TargetPath $temporaryRoot -ParentPath $output
            Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
        }
    }
}

New-OfflinePackage
