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

In addition, any folder with round brackets () won’t be included in the URL path.

`/app/dashboard/(overview)/page.tsx` corresponds to the `/dashboard` route since it sits directly inside the dashboard folder, and (overview) will be ignored as the URL path.

![routingoverview](https://nextjs.org/_next/image?url=%2Flearn%2Fdark%2Froute-group.png&w=3840&q=75 "Routing Overview")

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

## API Routes

We use `page.tsx` for page displays

On the other hand, we use `route.tsx`  to create web APIs

`route.tsx`

```jsx
export async function GET() {
  return Response.json({ message: 'Hello World' })
}
```

Next JS supports all REST API types such as POST, UPDATE, DELETE

See the documentation on how to pass in request payloads etc: 
https://nextjs.org/docs/app/api-reference/file-conventions/route 


In `app/seed/route.ts` we define a several POST requests to insert and seed data into our Postgres SQL database. 

Given a JSON list of items to insert into a DB, we use .map() to insert the items one by one, and wrap the entire code using `Promise.all()`.  This returns a single successful Promise if all the insertions are successful. 

```TSX
const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );
```


## Fetching data from SQL
In `/app/lib/data.ts` we import the postgres library and write SQL queries to fetch data from our SQL database. 

Be sure to use Async Await since we need to wait for the data to load. 

#### Request Waterfall vs Parallel Requests

Using multiple Async / Await request results in a request waterfall, in which each request is executed sequentially and blocks one another. 

`fetchRevenue() -> fetchLatestInvoices() -> fetchCardData()`

```TSX
const revenue = await fetchRevenue();
const latestInvoices = await fetchLatestInvoices(); // wait for fetchRevenue() to finish
const {
  numberOfInvoices,
  numberOfCustomers,
  totalPaidInvoices,
  totalPendingInvoices,
} = await fetchCardData(); // wait for fetchLatestInvoices() to finish
```

![requestwaterfall](https://nextjs.org/_next/image?url=%2Flearn%2Fdark%2Fsequential-parallel-data-fetching.png&w=3840&q=75 "Request Waterfall")

To fetch data requests in parallel, we use `Promise.all()`

```TSX
const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);
```

## Loading and Streaming
The `loading.tsx` page is built on top of React Suspense. It will be shown while the main `page.tsx` is loading.

We can also apply the loading UI to an individual component instead of the entire page. 

We start by importing the React Suspense component and wrapping it around the slow-loading component. We provide a fallback component, that will be rendered while the main component is loading. 

`/app/dashboard/(overview)/page.tsx`
```jsx
import { Suspense } from 'react';
import { RevenueChartSkeleton } from '@/app/ui/skeletons';

//Wrap Suspense around slow loading component
<Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
</Suspense>
```

We refactor the code such that the async function call to fetch data occurs within the component itself. This also simplifies the code, removing the need to pass props. 

Inside the component:
`/app/ui/dashboard/revenue-chart.tsx`
```jsx
import { fetchRevenue } from '@/app/lib/data';

export default async function RevenueChart() { // Make component async, remove the props
  const revenue = await fetchRevenue(); // Fetch data inside the component
  ...
}
```

We can also the loading UI to groups of components. 

In example below, CardWrapper contains several components grouped together. The loading UI will apply to the entire group.
```jsx
<Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
</Suspense>
```


