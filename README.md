# TaskFlow - Modern Project Management

A beautiful and intuitive task management application for teams and individuals. Built with Next.js, Tailwind CSS, and PostgreSQL.

![TaskFlow Screenshot](https://via.placeholder.com/800x450.png?text=TaskFlow+Screenshot)

## Features

- **Project Management**: Create and manage multiple projects
- **Task Organization**: Organize tasks in three columns - Todo, In Progress, and Done
- **Drag and Drop**: Easily move tasks between columns
- **Checklists**: Add checklist items to tasks to track progress
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: See task status updates in real-time
- **Beautiful UI**: Modern design with smooth animations

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (hosted on Railway)
- **ORM**: Prisma
- **State Management**: React Context API + SWR for data fetching
- **Animations**: Framer Motion
- **Drag and Drop**: react-beautiful-dnd

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or a Railway account)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your PostgreSQL connection string:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/taskflow"
     NEXTAUTH_SECRET="your-secret-key-for-jwt-encryption"
     NEXTAUTH_URL="http://localhost:3000"
     ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Railway Deployment

1. Create a new project on [Railway](https://railway.app/)
2. Add a PostgreSQL database to your project
3. Connect your GitHub repository
4. Set the environment variables:
   - `DATABASE_URL`: The connection string provided by Railway
   - `NEXTAUTH_SECRET`: A secure random string
   - `NEXTAUTH_URL`: Your production URL

## Project Structure

```
taskflow/
├── prisma/                # Prisma schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── projects/      # Project pages
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── projects/      # Project-related components
│   │   ├── tasks/         # Task-related components
│   │   └── ui/            # UI components
│   └── lib/               # Utility functions and hooks
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from modern task management apps
- Built with love and attention to detail
