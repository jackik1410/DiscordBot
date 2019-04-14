echo off
cls
echo %CD%
#pause
cls

:loop
cls
call node bot.js
#pause
goto loop
