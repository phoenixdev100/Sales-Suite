#!/bin/bash

echo "========================================"
echo "   Sales Suite Setup Script"
echo "========================================"
echo

echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install backend dependencies"
    exit 1
fi

echo
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install frontend dependencies"
    exit 1
fi

echo
echo "========================================"
echo "   Setup Complete!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Set up PostgreSQL database"
echo "2. Update backend/.env with your database URL"
echo "3. Run: cd backend && npx prisma migrate dev"
echo "4. Run: cd backend && npm run db:seed"
echo "5. Start backend: cd backend && npm run dev"
echo "6. Start frontend: cd frontend && npm run dev"
echo
echo "Default admin credentials:"
echo "Email: admin@example.com"
echo "Password: admin123"
echo
