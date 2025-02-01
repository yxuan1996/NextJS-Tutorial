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

## Pages Layouts and Routing
In Next JS, nested folders are used to create routes. 

the `/app` folder is the root directory

A `page.tsx` file is the component that defines the page layout.

![routing1](https://nextjs.org/_next/image?url=%2Flearn%2Fdark%2Ffolders-to-url-segments.png&w=3840&q=75 "Routing 1")

For example, the `/app/page.tsx` file corresponds to the root route `/`

`/app/dashboard/page.tsx` corresponds to the `/dashboard` route

![routing2](https://nextjs.org/_next/image?url=%2Flearn%2Fdark%2Fdashboard-route.png&w=3840&q=75 "Routing 2")

#### Shared Layout

We can use the `layout.tsx` file to create a shared UI template that can be used by multiple pages. 

Example: `app/dashboard/layout.tsx`. We define a navigation bar in the left side of this layout. This layout will be applied to all the pages and subpages in the dashboard folder, such as `/dashboard`, `/dashboard/customers`, `/dashboard/invoices`

The Layout component takes in the `children` prop. This is where the rest of the pages will be rendered. 

#### Navigation
The `<Link/>` component allows us to do client side navigation. 

The Link component is similar to using `<a>` tags, but instead of `<a href="…">`, you use `<Link href="…">`

Link prefetches the code for the linked route. This allows for instantaneous page transitions.

`/app/ui/dashboard/nav-links.tsx`
We start by importing the Link component from the Next JS library
```TSX
import Link from 'next/link';
```

We then replace all the a tags with Link tags. 

#### Showing Active Pages
We can use the `usePathName()` Hook to determine the current URL path. 

Since this is a React Hook, it will only work on client side components. 

we need to specify `'use client';` on top of the component file. 

Example in `/app/ui/dashboard/nav-links.tsx`:

We import the React Hook
```TSX
import { usePathname } from 'next/navigation';
```

We assign the current URL path to a variable
```TSX
export default function NavLinks() {
  const pathname = usePathname();
  // ...
}
```

We can use clsx to apply styling classes when the pathname matches the current link
```TSX
import clsx from 'clsx';

className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
```


