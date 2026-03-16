@echo off

@REM Set source and destination locations
@REM Note the quote folder must be mapped to drive Q: for this script to work
set SRC_DIR=Q:\Beta Star\Beta Star Sterilizer Checklist\beta-star-sterilizer-configurator\dist
set DEST_DIR=Q:\Beta Star\Beta Star Sterilizer Checklist

@REM move to the Q: drive
Q:
cd Beta Star\Beta Star Sterilizer Checklist\beta-star-sterilizer-configurator
echo.
echo pulling information from Github repo...this may take a few minutes...
echo.
call git pull origin main
echo.
echo building distributable file...
echo .
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo Error: npm run build failed.
    exit /b %ERRORLEVEL%
)
REM Step 6: Copy the contents of the /dist folder to the directory above the root directory
echo Copying contents of /dist to the parent directory...

IF NOT EXIST "%SRC_DIR%" (
    echo Error: Source directory %SRC_DIR% does not exist.
    exit /b 1
)

xcopy "%SRC_DIR%\*" "%DEST_DIR%\" /E /H /Y

IF %ERRORLEVEL% NEQ 0 (
    echo Error: Copying files failed.
    exit /b %ERRORLEVEL%
)

echo Build and copy completed successfully.
pause