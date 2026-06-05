# Expense Tracker Dashboard

## Overview

Expense Tracker Dashboard is a modern personal finance management application designed to help users efficiently track income, expenses, savings, and budgets. The platform provides an intuitive dashboard for managing personal finances, offering real-time analytics, transaction management, budget monitoring, and AI-powered financial insights using Google Gemini API.

## Features

### Authentication & Security

* Secure User Authentication and Authorization
* Session Management
* Protected User Data

### Financial Management

* Income and Expense Tracking
* Category-wise Transaction Management
* Budget Creation and Monitoring
* Savings Goal Tracking
* Real-time Balance Calculation

### Analytics & Reporting

* Financial Analytics Dashboard
* Interactive Charts and Visual Reports
* Spending Pattern Analysis
* Budget Performance Monitoring
* Transaction History Tracking

### AI-Powered Features

* Personalized Financial Insights
* Spending Analysis using Google Gemini API
* Smart Recommendations for Better Financial Management
* AI-assisted Budget Optimization Suggestions

### User Experience

* Responsive User Interface
* Mobile-Friendly Design
* Smooth Navigation and Interactive Components
* Real-time Alerts and Notifications

## Technologies Used

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Motion Animation Library

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* JSON File-based Database (`db.json`)

### APIs & Libraries

* Google Gemini API
* Lucide React Icons

## Installation

### Clone the Repository

```bash
git clone https://github.com/kani0301/expense-tracker-dashboard.git
cd expense-tracker-dashboard
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
NODE_ENV=development
```

### Start the Application

```bash
npm run dev
```

The application will run at:

```text
http://localhost:3000
```

## Project Structure

```text
expense-tracker-dashboard/
├── src/
│   ├── components/
│   │   ├── AuthView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── TransactionsView.tsx
│   │   ├── BudgetsView.tsx
│   │   ├── SavingsView.tsx
│   │   ├── AIInsightsView.tsx
│   │   ├── ReportsView.tsx
│   │   ├── ProfileView.tsx
│   │   └── Sidebar.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   ├── db.ts
│   ├── types.ts
│   ├── main.tsx
│   └── index.css
├── server.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── README.md
```

## Future Enhancements

* Expense Forecasting using Machine Learning
* Multi-user Collaboration Features
* Mobile Application Support
* Export Reports to PDF and Excel
* Database Integration with MongoDB or PostgreSQL
* Recurring Transaction Management
* Advanced Financial Analytics

## Contributing

Contributions are welcome. Feel free to fork the repository and submit pull requests for improvements.

## Author

**Kanishkaa R**

## License

This project is intended for educational and internship demonstration purposes.
