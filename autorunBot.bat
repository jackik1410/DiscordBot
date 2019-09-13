set file=bot.js
echo off
cls
echo %CD%
#pause
cls

:choice
choice /C idr /t 30 /d r /M "do you want to Install, Debug or just Run?"
if %ERRORLEVEL% == 3 goto loop
if %ERRORLEVEL% == 1 node install
if %ERRORLEVEL% == 2 node inspect %file%
goto choice

:loop
::I just prefer matrix-style terminals...
color 0A
cls
call node %file%
if %ERRORLEVEL% NEQ 0 ( ::pauses if didn't exit smoothly, recommended only if bot not on a remote machine
    color 0C
    echo.
    echo.
    echo App exited with error code %ERRORLEVEL%
    pause
)

::timeout /t 1 /nobreak ::allows for timeouts before restarts. Recommended when on a remote machine and provides the opportunity to still see errors
::use either the if or the timeout

goto loop
