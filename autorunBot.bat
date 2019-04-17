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
::timeout /t 3 /nobreak

goto loop
