# EV Smart Charging System

A modern, full-stack electric vehicle charging management system built with React, TypeScript, and Node.js.

## 🚀 Features

### 🔐 Authentication & User Management
- **Admin Dashboard**: Complete admin panel with user and station management
- **User Authentication**: Secure login system with role-based access
- **User Profiles**: Personalized user experience

### ⚡ Charging Management
- **Station Discovery**: Find nearby charging stations
- **Real-time Monitoring**: Live charging session tracking
- **Smart Scheduling**: Optimize charging times for cost efficiency
- **Session History**: Complete charging history with detailed analytics

### 💰 Integrated Wallet System
- **Multiple Payment Methods**: UPI, Credit/Debit Cards, Net Banking
- **Real UPI Integration**: Direct payments to `vedantvjadhav@okhdfc`
- **Instant Top-up**: Quick amount selection (₹100-₹5000)
- **Bonus System**: Get bonus money on larger top-ups
- **Transaction History**: Detailed payment and charging records

### 📊 Analytics & Insights
- **Spending Analytics**: Track charging expenses and patterns
- **Usage Statistics**: Monitor charging frequency and duration
- **Cost Optimization**: Smart recommendations for cost savings
- **Export Data**: Download transaction history as CSV

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop and mobile
- **Tailwind CSS**: Modern, clean design system
- **Interactive Components**: Smooth animations and transitions
- **Dark/Light Theme Ready**: Prepared for theme switching

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1**: Latest React with hooks and context
- **TypeScript**: Full type safety and better developer experience
- **Vite 5.4.2**: Lightning-fast development and build tool
- **React Router 7.8.2**: Modern routing with data loading
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons

### Backend (Optional)
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Fast, unopinionated web framework
- **SQLite + Knex.js**: Lightweight database with query builder
- **JWT Authentication**: Secure token-based authentication
- **WebSocket**: Real-time communication for live updates

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ev-smart-charging.git
   cd ev-smart-charging
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Default Login Credentials
- **Admin**: `admin` / `demo`
- **User**: `user` / `demo`

## 📱 Usage

### For Users
1. **Login** with your credentials
2. **View Dashboard** to see charging statistics
3. **Add Money** to wallet using UPI/Cards
4. **Find Stations** and start charging sessions
5. **Monitor** real-time charging progress
6. **View History** and download transaction records

### For Admins
1. **Access Admin Panel** after login
2. **Manage Users** - view, add, edit user accounts
3. **Manage Stations** - add new charging stations
4. **View Analytics** - system-wide usage and revenue stats
5. **Generate Reports** - comprehensive business insights

## 💳 Payment Integration

### UPI Integration
- **Direct UPI Payments**: Pay directly to `vedantvjadhav@okhdfc`
- **QR Code Support**: Scan and pay with any UPI app
- **One-click Copy**: Copy UPI ID for easy payments
- **Real-time Verification**: Instant payment confirmation

### Supported Payment Methods
- **UPI**: PhonePe, Google Pay, Paytm, etc.
- **Credit/Debit Cards**: Visa, Mastercard, RuPay
- **Net Banking**: All major banks supported
- **Digital Wallets**: Integrated wallet system

## 🎯 Project Structure

```
src/
├── components/          # React components
│   ├── Admin/          # Admin dashboard components
│   ├── Auth/           # Authentication components
│   ├── Charging/       # Charging interface components
│   ├── Dashboard/      # Dashboard components
│   ├── History/        # Transaction history components
│   ├── Layout/         # Layout components (Navbar, etc.)
│   ├── Notifications/  # Notification system
│   └── Wallet/         # Wallet and payment components
├── context/            # React Context for state management
├── lib/                # Utility functions and helpers
├── services/           # API services and data management
└── types/              # TypeScript type definitions
```

## 🌟 Key Features Breakdown

### Wallet System
- **Quick Top-up**: Predefined amounts with bonus offers
- **Custom Amounts**: Enter any amount between ₹50-₹10,000
- **Payment Methods**: UPI, Cards, Net Banking
- **Transaction History**: Complete payment records
- **Export Feature**: Download CSV reports

### Charging Interface
- **Station Map**: Interactive map with nearby stations
- **Real-time Status**: Live availability and pricing
- **Session Management**: Start, stop, and monitor charging
- **Cost Calculator**: Estimate charging costs
- **Smart Notifications**: Updates on charging progress

### Admin Dashboard
- **User Management**: Complete CRUD operations
- **Station Management**: Add/edit charging stations
- **Analytics**: Revenue and usage statistics
- **System Monitoring**: Real-time system health

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure your environment variables
3. Set up database (if using backend)

## 📈 Future Enhancements

- [ ] **Mobile App**: React Native mobile application
- [ ] **Real-time Map**: Live charging station availability
- [ ] **Smart Scheduling**: AI-powered optimal charging times
- [ ] **Social Features**: Share charging experiences
- [ ] **Loyalty Program**: Reward frequent users
- [ ] **Green Analytics**: Carbon footprint tracking
- [ ] **Voice Commands**: Alexa/Google Assistant integration
- [ ] **Blockchain**: Decentralized payment system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Thanks to the React and TypeScript communities
- Inspired by modern fintech and mobility solutions
- Special thanks to all contributors and testers

---

**Built with ❤️ for a sustainable future**
