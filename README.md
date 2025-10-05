# 🏃‍♀️ **Copper & Cloves Studio Management System**

A comprehensive, privacy-focused management system for fitness studios built with React, TypeScript, and Tailwind CSS. Features advanced data protection, member management, and seamless integration with the Momence API.

## ✨ **Key Features**

### 🔒 **Enhanced Data Protection**
- **Smart Redaction**: Phone numbers and emails show only 2 characters (e.g., `jo**@******.com`, `12******45`)
- **Admin Override**: Use key "2303" to temporarily view full contact details when needed
- **Comprehensive Coverage**: All API responses automatically protected

### 👥 **Member Management**
- **Advanced Search**: Find members by name, email, or phone number
- **Create New Members**: Add new members directly from the search interface
- **Instant Booking**: Create a member and immediately add them to a class
- **Form Validation**: Comprehensive validation for all member data fields
- **Data Protection**: New member data automatically protected by redaction system

### 📝 **Notes Management**
- **Universal Notes**: Add, edit, and delete notes for any class, booking, or cancellation
- **Persistent Storage**: Notes saved locally and restored between sessions
- **Timestamped**: All notes include creation time and user attribution

### 📅 **Today Tab**
- **Focused View**: Dedicated tab showing only today's classes
- **Visual Clarity**: Past classes appear in grayscale for easy identification

### ❌ **Cancelled Bookings Integration**
- **Complete Picture**: View both regular bookings and cancellations
- **Unified Interface**: Cancellations appear alongside regular bookings

## 🚀 **Quick Start**

```bash
# Clone the repository
git clone https://github.com/Jimmeey2323/copper-and-cloves.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## 👥 **Member Management Workflow**

### Creating New Members
1. **Search for existing members** using the member search
2. **If not found**, click "Create New Member"
3. **Fill the form** with required member details
4. **Submit** to create and optionally add to class immediately

### API Integration
The system uses the Momence API to create members and add them to classes:
- Create Member: `POST /api/v2/host/members`
- Add to Class: `POST /api/v2/host/sessions/{sessionId}/bookings/free`

## 🔐 **Security Features**
- All sensitive data automatically redacted
- Admin override available with key: **2303**
- Comprehensive form validation

Built with ❤️ for fitness studio management
