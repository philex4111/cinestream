#!/bin/sh
#
# Gradle start up script for UN*X
GRADLE_OPTS="${GRADLE_OPTS:-"-Xmx64m -Xms64m"}"
APP_NAME="Gradle"
APP_BASE_NAME=$(basename "$0")
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'

set -e

# Determine the Java command to use
if [ -n "$JAVA_HOME" ]; then
    JAVACMD="$JAVA_HOME/bin/java"
else
    JAVACMD="java"
fi

exec "$JAVACMD" -classpath "$CLASSPATH" \
    org.gradle.wrapper.GradleWrapperMain "$@"
