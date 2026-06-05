# Expense Tracker Dashboard

## Overview

Expense Tracker Dashboard is a modern personal finance management application designed to help users efficiently track income, expenses, savings, and budgets. The platform provides an intuitive dashboard with real-time financial analytics, interactive visualizations, and AI-powered insights powered by Google Gemini API to help users make better financial decisions.

## Features

* **User Authentication and Authorization** - Secure login and user management
* **Income and Expense Tracking** - Log and categorize all financial transactions
* **Budget Management** - Set and monitor budget limits for different categories
* **Savings Goal Monitoring** - Track progress towards financial goals
* **Financial Analytics Dashboard** - Comprehensive overview of financial status
* **Interactive Charts and Reports** - Visual representation of spending patterns and trends
* **Category-wise Expense Tracking** - Organize expenses by custom categories
* **AI-Powered Financial Insights** - Get personalized recommendations and analysis using Google Gemini API
* **Responsive User Interface** - Works seamlessly on desktop and mobile devices
* **Secure Data Management** - encrypted data storage and secure API communication

## Technologies Used

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* MongoDB (or your database choice)

### Additional Tools & APIs

* Google Gemini API - AI-powered financial insights
* Chart.js - Interactive data visualization

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kani0301/expense-tracker-dashboard.git
   ```

2. Navigate to the project directory:

   ```bash
   cd expense-tracker-dashboard
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables:

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Frontend
   VITE_API_URL=http://localhost:5000

   # Backend
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

## Project Structure

```
expense-tracker-dashboard/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── App.tsx
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── server.ts
│   └── package.json
└── README.md
```

## Future Enhancements

* AI-based Financial Recommendations
* Expense Forecasting using Machine Learning
* Multi-user Collaboration Features
* Mobile Application Support (React Native)
* Export Reports (PDF, Excel)
* Budget Alerts and Notifications
* Recurring Transaction Templates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Kanishkaa R

---

For more information or support, please open an issue on the GitHub repository.
