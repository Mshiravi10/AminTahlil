@echo off
setlocal enabledelayedexpansion

echo ================================================
echo    امین‌تحلیل - Deployment Script for Windows
echo ================================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERROR] This script requires administrator privileges.
    echo Please right-click on the script and select "Run as administrator".
    pause
    exit /b 1
)

:: Set the project directories
set PROJECT_ROOT=%~dp0
set BACKEND_DIR=%PROJECT_ROOT%backend
set FRONTEND_DIR=%PROJECT_ROOT%frontend

echo [INFO] Project root: %PROJECT_ROOT%
echo [INFO] Backend directory: %BACKEND_DIR%
echo [INFO] Frontend directory: %FRONTEND_DIR%
echo.

:: Check for dependencies
call :check_dependencies
if %errorLevel% NEQ 0 (
    pause
    exit /b 1
)

:: Ask user what to deploy
echo Please select what you want to deploy:
echo 1. Backend only
echo 2. Frontend only
echo 3. Both Backend and Frontend
echo 4. Full stack with Redis (using Docker)
set /p DEPLOY_OPTION="Enter option (1-4): "

if "%DEPLOY_OPTION%"=="1" (
    call :deploy_backend
) else if "%DEPLOY_OPTION%"=="2" (
    call :deploy_frontend
) else if "%DEPLOY_OPTION%"=="3" (
    call :deploy_backend
    call :deploy_frontend
) else if "%DEPLOY_OPTION%"=="4" (
    call :deploy_docker
) else (
    echo [ERROR] Invalid option. Please try again.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployment completed!
echo.
pause
exit /b 0

:: =========================================
:: Function to check dependencies
:: =========================================
:check_dependencies
echo Checking dependencies...

:: Check for .NET SDK
dotnet --version >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERROR] .NET SDK is not installed.
    echo Please download and install .NET SDK 8.0 or later from:
    echo https://dotnet.microsoft.com/download
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('dotnet --version') do set DOTNET_VERSION=%%a
    echo [OK] .NET SDK version !DOTNET_VERSION! is installed.
)

:: Check for Node.js
node --version >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERROR] Node.js is not installed.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    echo [OK] Node.js version !NODE_VERSION! is installed.
)

:: Check for npm
npm --version >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERROR] npm is not installed.
    echo Please download and install Node.js (includes npm) from:
    echo https://nodejs.org/
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
    echo [OK] npm version !NPM_VERSION! is installed.
)

:: Check for Docker if option 4 is selected
if "%DEPLOY_OPTION%"=="4" (
    docker --version >nul 2>&1
    if %errorLevel% NEQ 0 (
        echo [ERROR] Docker is not installed.
        echo Please download and install Docker Desktop from:
        echo https://www.docker.com/products/docker-desktop
        exit /b 1
    ) else (
        for /f "tokens=*" %%a in ('docker --version') do set DOCKER_VERSION=%%a
        echo [OK] !DOCKER_VERSION! is installed.
    )

    docker-compose --version >nul 2>&1
    if %errorLevel% NEQ 0 (
        echo [ERROR] Docker Compose is not installed.
        echo Please install Docker Desktop which includes Docker Compose.
        exit /b 1
    ) else (
        for /f "tokens=*" %%a in ('docker-compose --version') do set COMPOSE_VERSION=%%a
        echo [OK] !COMPOSE_VERSION! is installed.
    )
)

echo [INFO] All required dependencies are installed!
echo.
exit /b 0

:: =========================================
:: Function to deploy backend
:: =========================================
:deploy_backend
echo.
echo =======================================
echo        Deploying Backend
echo =======================================
echo.

:: Install .NET tools if needed
echo [INFO] Installing .NET tools...
dotnet tool restore

:: Navigate to backend directory
pushd "%BACKEND_DIR%"

:: Restore dependencies
echo [INFO] Restoring backend dependencies...
dotnet restore
if %errorLevel% NEQ 0 (
    echo [ERROR] Failed to restore backend dependencies.
    popd
    exit /b 1
)

:: Build the backend
echo [INFO] Building backend...
dotnet build --configuration Release --no-restore
if %errorLevel% NEQ 0 (
    echo [ERROR] Failed to build backend.
    popd
    exit /b 1
)

:: Start Redis if it's not running via Docker
if "%DEPLOY_OPTION%"=="1" (
    echo [INFO] Checking if Redis is running...
    curl -s http://localhost:6379 >nul 2>&1
    if %errorLevel% NEQ 0 (
        echo [WARNING] Redis does not appear to be running on port 6379.
        echo [WARNING] The notification system requires Redis to function properly.
        echo [WARNING] Please start Redis separately or use option 4 to deploy with Docker.
    ) else (
        echo [OK] Redis is running on port 6379.
    )
)

:: Run the backend
echo [INFO] Starting backend server...
start "امین‌تحلیل Backend" cmd /c "dotnet run --configuration Release --no-build --urls=http://localhost:5000 & pause"
echo [INFO] Backend is running at http://localhost:5000

popd
exit /b 0

:: =========================================
:: Function to deploy frontend
:: =========================================
:deploy_frontend
echo.
echo =======================================
echo        Deploying Frontend
echo =======================================
echo.

:: Navigate to frontend directory
pushd "%FRONTEND_DIR%"

:: Install dependencies
echo [INFO] Installing frontend dependencies...
call npm install
if %errorLevel% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies.
    popd
    exit /b 1
)

:: Build the frontend for production or start development server
echo Please select frontend deployment mode:
echo 1. Development mode (with hot reload)
echo 2. Production build
set /p FRONTEND_MODE="Enter option (1-2): "

if "%FRONTEND_MODE%"=="1" (
    :: Start the development server
    echo [INFO] Starting frontend development server...
    start "امین‌تحلیل Frontend (Development)" cmd /c "npm start & pause"
    echo [INFO] Frontend development server is running at http://localhost:3000
) else if "%FRONTEND_MODE%"=="2" (
    :: Build for production
    echo [INFO] Building frontend for production...
    call npm run build
    if %errorLevel% NEQ 0 (
        echo [ERROR] Failed to build frontend for production.
        popd
        exit /b 1
    )
    
    :: Serve the production build
    echo [INFO] Installing serve globally...
    call npm install -g serve
    
    echo [INFO] Serving production build...
    start "امین‌تحلیل Frontend (Production)" cmd /c "serve -s build -l 3000 & pause"
    echo [INFO] Frontend production build is served at http://localhost:3000
) else (
    echo [ERROR] Invalid option.
    popd
    exit /b 1
)

popd
exit /b 0

:: =========================================
:: Function to deploy using Docker
:: =========================================
:deploy_docker
echo.
echo =======================================
echo     Deploying with Docker Compose
echo =======================================
echo.

:: Navigate to project root
pushd "%PROJECT_ROOT%"

:: Check if project is already running
echo [INFO] Checking if containers are already running...
docker-compose ps >nul 2>&1
if %errorLevel% EQU 0 (
    docker-compose ps | findstr "Up" >nul 2>&1
    if %errorLevel% EQU 0 (
        echo [INFO] Some containers are already running.
        echo Do you want to stop and remove them before deploying? (y/n)
        set /p REMOVE_EXISTING="Enter option (y/n): "
        
        if /i "%REMOVE_EXISTING%"=="y" (
            echo [INFO] Stopping and removing existing containers...
            docker-compose down
        )
    )
)

:: Build and start Docker containers
echo [INFO] Building and starting Docker containers...
docker-compose up --build -d
if %errorLevel% NEQ 0 (
    echo [ERROR] Failed to deploy with Docker Compose.
    popd
    exit /b 1
)

echo.
echo [SUCCESS] Deployed with Docker Compose!
echo.
echo Frontend is running at http://localhost:3000
echo Backend API is running at http://localhost:5000
echo Jaeger UI is running at http://localhost:16686
echo Redis is running on port 6379
echo.

:: Open the application in the default browser
timeout /t 5 >nul
echo [INFO] Opening application in browser...
start http://localhost:3000

popd
exit /b 0
