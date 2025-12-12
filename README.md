# WIMSW.com - What Is My Stuff Worth?

AI-powered market research and pricing for secondhand items. Instantly analyze items, research market prices, and get optimized listings for multiple platforms.

## Features

- 📸 **AI Image Analysis** - Upload photos to automatically identify items, brands, and conditions
- 💰 **Market Research** - Get real-time pricing data from eBay, Poshmark, Mercari, Depop, and more
- 📊 **Price Recommendations** - AI-powered pricing suggestions based on market trends
- 🎯 **Platform Comparison** - Compare potential profits across different selling platforms
- ✍️ **Auto-Generated Listings** - Get optimized titles and descriptions for each platform
- 🔄 **Local vs Shipping** - Toggle between local pickup and shipping platforms

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **AI**: Google Gemini API (with automatic fallback)
- **Data**: Google Sheets integration
- **Validation**: Zod
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key
- Google Cloud Service Account (for Sheets integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WhatIsMyStuffWorth
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Google Sheets Integration
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important**: Never commit `.env.local` to version control!

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
WhatIsMyStuffWorth/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── analyze-item/  # Image analysis endpoint
│   │   ├── market-research/ # Market data endpoint
│   │   └── ...
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── interactive-demo.tsx
│   ├── market-research.tsx
│   └── ...
├── lib/                   # Utility functions
│   ├── gemini.ts         # Gemini AI utility with fallback
│   ├── env.ts            # Environment validation
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # General utilities
└── styles/               # Global styles
```

## API Routes

### POST `/api/analyze-item`
Analyzes an uploaded image to identify item details.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Item Name",
    "brand": "Brand",
    "category": "Category",
    "size": "Size",
    "condition": "Condition",
    "estimated_price": 50
  }
}
```

### POST `/api/market-research`
Performs market research for an item.

**Request Body:**
```json
{
  "name": "Item Name",
  "brand": "Brand",
  "category": "Category",
  "condition": "Good",
  "estimated_price": 50,
  "description": "Optional description",
  "sizeInput": "M",
  "ageInput": "2 years",
  "isLocalOnly": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "similar_items": [...],
    "statistics": {...},
    "insights": {...}
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI analysis |
| `GOOGLE_SHEET_ID` | Yes | Google Sheet ID for data storage |
| `GOOGLE_CLIENT_EMAIL` | Yes | Service account email |
| `GOOGLE_PRIVATE_KEY` | Yes | Service account private key |
| `NODE_ENV` | No | Environment (development/production/test) |

## Features in Detail

### AI Image Analysis
- Automatically identifies brand, condition, size, and category
- Provides conservative price estimates
- Fallback mechanism ensures reliability

### Market Research
- Compares prices across multiple platforms
- Shows sold vs active listings
- Provides similarity scores
- Generates optimal search terms

### Platform Optimization
- Custom listing titles for each platform
- Platform-specific settings and recommendations
- Fee calculations and net profit estimates

## Development

### Code Quality
- TypeScript strict mode enabled
- Zod validation for all API inputs
- Environment variable validation on startup
- Toast notifications for user feedback

### Performance
- Next.js Image optimization enabled
- Turbopack for faster development
- Component code splitting
- Optimized bundle size

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team or create an issue in the repository.

## Roadmap

- [ ] Rate limiting for API routes
- [ ] User authentication
- [ ] Saved searches/history
- [ ] Email notifications
- [ ] Mobile app
- [ ] Bulk analysis
- [ ] Export to CSV/PDF

---

Built with ❤️ using Next.js and Google Gemini AI
