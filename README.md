# CarCraftr 🚗

A comprehensive car information and community platform that provides detailed car specifications, market analysis, user reviews, maintenance guides, and community forums for car enthusiasts and professionals.

## 🌟 Features

### 🚙 Car Information
- **Detailed Car Specifications** - Comprehensive specs, variants, and features
- **Car Search & Filtering** - Advanced search with multiple filters
- **Car Recommendations** - AI-powered car suggestions based on preferences
- **Car Comparison** - Side-by-side comparison of multiple vehicles

### 📊 Market Analysis
- **Price Trends** - Historical and current pricing data
- **Resale Values** - Depreciation analysis and predictions
- **Market Demand** - Supply and demand insights
- **Best Time to Buy** - Optimal purchasing recommendations
- **Dealer Inventory** - Local dealer availability

### 👥 Community Features
- **User Reviews** - Authentic user experiences and ratings
- **Community Forums** - Discussion boards for car-specific topics
- **Maintenance Guides** - User-generated repair and maintenance tutorials
- **Fuel Economy Reports** - Real-world fuel consumption data
- **Common Issues** - Problem reporting and solutions

### 📰 Content
- **News Articles** - Latest automotive industry news
- **Blog Posts** - Expert insights and guides
- **User Authentication** - Secure user accounts and profiles

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Swagger** - API documentation
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

## 📁 Project Structure

```
carCraftr/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── tasks/           # Background tasks
│   ├── server.js        # Main server file
│   ├── swagger.json     # API documentation
│   └── package.json     # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── config/      # Configuration files
│   │   └── App.js       # Main app component
│   ├── public/          # Static files
│   └── package.json     # Frontend dependencies
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd carCraftr
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file in backend directory
   DATABASE_URL=mongodb://localhost:27017/carcraftr
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start the backend server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Access API documentation**
   - Open http://localhost:5000/api-docs

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend development server**
   ```bash
   npm start
   ```

3. **Access the application**
   - Open http://localhost:3000

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI 3.0. Access the interactive documentation at:
- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-domain.com/api-docs

### Key API Endpoints

- **Authentication**: `/api/auth/*`
- **Cars**: `/api/cars/*`
- **News**: `/api/news/*`
- **Blogs**: `/api/blogs/*`
- **Market Data**: `/api/market/*`
- **Reviews**: `/api/reviews/*`
- **Forums**: `/api/forums/*`
- **Maintenance**: `/api/maintenance/*`
- **Fuel Economy**: `/api/fuel-economy/*`
- **Common Issues**: `/api/common-issues/*`

## 🔧 Development

### Database Setup
The application uses MongoDB. You can either:
- Use a local MongoDB instance
- Use MongoDB Atlas (cloud)
- Use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=mongodb://localhost:27017/carcraftr
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔮 Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Integration with external APIs
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] User-generated content moderation
- [ ] Performance optimization
- [ ] Internationalization (i18n)

---

**CarCraftr** - Empowering car enthusiasts with comprehensive automotive information and community features. 