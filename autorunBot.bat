echo off
cls
echo %CD%
#pause
cls

:loop
cls
call node bot.js
::pause
  ::for better error diagnosis, uncomment if wanted
timeout /t 1 /nobreak

goto loop
