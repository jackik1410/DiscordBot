echo off
cls
echo %CD%
#pause
cls

:loop
cls
call node bot.js
if %ERRORLEVEL% NEQ 0 ( ::pauses if didn't exit smoothly, recommended only if bot not on a remote machine
  pause
)

::timeout /t 1 /nobreak

goto loop
