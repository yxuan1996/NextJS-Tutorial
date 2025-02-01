# NextJS-Tutorial
Next JS Dashboard Application based on the official NextJS tutorials. (https://nextjs.org/learn/dashboard-app)

## Installation

We start by installing the pnpm package manager
```
npm install -g pnpm
```

We use the create-next-app command to generate a starter application with boilerplate code
```
npx create-next-app@latest nextjs-dashboard --example "https://github.com/vercel/next-learn/tree/main/dashboard/starter-example" --use-pnpm
```

Navigate to the project folder
```
cd nextjs-dashboard
```

Running the app
```
pnpm dev
```

## Project Structure
We define our placeholder data in `/app/lib/placeholder-data.ts`. We will use this data to seed our initial database. 

Since our project uses typescript, we need to declare the datatypes in `/app/lib/definitions.ts`. If we are using an ORM such as Prisma or Drizzle, it will automatically generate the datatypes based on the database schema. 

## Styling
We are using Tailwind for Styling. We import the global stylesheet containing tailwind directives at the top of each componnent
```
import '@/app/ui/global.css';
```

#### Conditional Styling
We can use clsx to conditionally apply styling classes depending on the value of a variable.

In `/app/ui/invoices/status.tsx`
```TSX
import clsx from 'clsx';
 
export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-sm',
        {
          'bg-gray-100 text-gray-500': status === 'pending',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
    // ...
)}
```

## Optimizing Fonts and Images

#### Fonts
Google fonts are included in Next JS. 

We define our fonts in `app/ui/fonts.ts`

We can then import and apply our fonts within our components. 

Example: `app/layout.tsx`
```TSX
// Import font
import { inter } from '@/app/ui/fonts';

// Applying the font to the body div
<body className={`${inter.className} antialiased`}>{children}</body>

```

https://nextjs.org/docs/pages/building-your-application/optimizing/fonts

#### Images
Instead of using the HTML `<img>` tag, we should use the NextJS Image component that comes with automatic image optimization and resizing. 

Example: `/app/page.tsx`

```TSX
import Image from 'next/image';

<Image
        src="/hero-desktop.png"
        width={1000}
        height={760}
        className="hidden md:block"
        alt="Screenshots of the dashboard project showing desktop version"
      />
```

