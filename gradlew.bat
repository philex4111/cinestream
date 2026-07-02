@echo off
:: Gradle wrapper with simple checks (avoids block-parsing issues)
set SCRIPT_DIR=%~dp0
if not exist "%SCRIPT_DIR%gradle\wrapper\gradle-wrapper.jar" goto :MISSING_WRAPPER
:: Quick sanity check: ensure wrapper jar is a reasonable size (>=10KB)
for %%I in ("%SCRIPT_DIR%gradle\wrapper\gradle-wrapper.jar") do set WRAPPER_SIZE=%%~zI
if %WRAPPER_SIZE% LSS 10240 goto :MISSING_WRAPPER
set GRADLE_OPTS=-Xmx64m -Xms64m
java -classpath "%SCRIPT_DIR%gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
goto :EOF
:MISSING_WRAPPER
echo ERROR: gradle-wrapper.jar missing or appears invalid in "%SCRIPT_DIR%gradle\wrapper\"
echo.
echo Fix options:
echo  1) Install Gradle and run: gradle wrapper
echo  2) Download the Gradle distribution matching gradle/wrapper/gradle-wrapper.properties (e.g., gradle-8.14.5-bin.zip) from:
echo     https://services.gradle.org/distributions/
echo     then extract gradle-wrapper.jar into gradle\wrapper\
echo.
exit /b 1
