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

## Search and Pagination

We will be using URL search params to manage search. This allows the search to be handled server-side. 

We will be using the following React hooks:

`useSearchParams` 

Obtain search params from the URL

For example, the URL of `/dashboard/invoices?page=1&query=pending` will translate to the following search params: `{page: '1', query: 'pending'}`

`usePathname` 

Obtain the current URL path

`useRouter`

Enables navigation between routes

Workflow:

1. Capture the user's input.
2. Update the URL with the search params.
3. Keep the URL in sync with the input field.
4. Update the table to reflect the search query.

#### 1) Capture user input
In `/app/ui/search.tsx` we define the search component. 

- We have a `<input>` component that allows user to enter the search terms. 
- We attach an 'onChange' event listener that calls a function when the input changes. 

#### 2) Update the URL with search params
- We use the `useSearchParams` React hook to generate URL params (Format: ?page=1&query=a)

```TSX
import { useSearchParams } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  // Initialize useSearchParams hook
  const searchParams = useSearchParams();
  
  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    console.log(term);

    // Generate URL params based on the search query value
    // If the search query is empty, remove the URL params
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
  }
  ...
}
```

- We get the current URL using `usePathname`
- We use `useRouter` to replace the URL with (baseURL + search params)

```TSX
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSearch(term: string) {
    ...
    replace(`${pathname}?${params.toString()}`);
  }
}
```

#### 3) Keep the URL and input in sync
We pass a default value to the search params
```TSX
defaultValue={searchParams.get('query')?.toString()}
```

#### 4) Update the Table
We modify the invoices page to accept a prop called `searchParams` and pass it to the Table component

```TSX
export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return(
    ...
    <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
    </Suspense>
  )
}
```

#### Debouncing
Currently, every keystroke causes the onChange function to fire, which results in significant server load. 

We can use debouncing to limit the rate that the function fires. 

```
pnpm i use-debounce
```

In `/app/ui/search.tsx` 
- We import the debounce library and limit the handleSearch function to run 300ms after the user finishes typing. 

```TSX
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback((term) => {
  console.log(`Searching... ${term}`);
 
  const params = new URLSearchParams(searchParams);
  if (term) {
    params.set('query', term);
  } else {
    params.delete('query');
  }
  replace(`${pathname}?${params.toString()}`);
}, 300);
```

## Mutate Data (Form Submission)

In this section, we will define a server action, which is a function that will run when a form is submitted. 

Inside the server action, we will validate the data and insert it into the database. 

#### Create Form
- In `/dashboard/invoices/create/page.tsx` we import and display the form component from `/app/ui/invoices/create-form`.
- When the form is submitted, the `createInvoice` function that is defined in `app/lib/actions.ts` is called.
- Note that `app/lib/actions.ts` has the 'use server' directive. This means the function will run server side with encryption, which enhances security. 
- We import the zod library, use it to define a schema, and then use it to parse incoming form data. We then run a SQL statement to insert data into the database.

#### Update Form (Dynamic Route)
The update form is similar to the create form, except that we need to obtain the invoice id from the dynamic route URL. 

We create a dynamic route using square brackets. 

For example: Edit Form page `invoices/[id]/edit/page.tsx`

The page component will accept an id as the prop.

![dynamic_route](https://nextjs.org/_next/image?url=%2Flearn%2Flight%2Fedit-invoice-route.png&w=3840&q=75 "Dynamic Route")

- Inside `/app/ui/invoices/buttons.tsx`, the `UpdateInvoice` function contains a `<Link>` button with an URL link. We will update this URL link to accept a dynamic id. (This is the button with a pencil icon beside each invoice)
```TSX
href={`/dashboard/invoices/${id}/edit`}
```

- We cannot pass an argument directly into a server action. The following code does not work: `<form action={updateInvoice(id)}>`
- Instead, we need to bind the server action to the argument. This ensures that all values passed to the server action are encoded. 
```TSX
// Bind the id to the server action
const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);

// Call the updated server action in the form
return <form action={updateInvoiceWithId}>{/* ... */}</form>;
```

Alternatively, we can also pass the id to the server via a hidden input field in the form.
```HTML
<input type="hidden" name="id" value={invoice.id} />
```

## Error Handling
The `error.tsx` page will be displayed if there are any errors on the main page. It serves as a fallback UI. 

Note that `error.tsx` needs to be a client component, so it will work offline in case of network errors.

#### 404 (Not found) errors
We can use the `Not Found` component from Next JS to handle undefined routes
```
import { notFound } from 'next/navigation';
```

We can then invoke the not found page if an item doesn't exist
```TSX
if (!invoice) {
    notFound();
  }
```

Lastly we create the `not-found.tsx` file. This will contain the UI for the not found page.

## Accessibility
We can use the ESLint plugin to help detect accessibility issues. 

Add lint in `package.json`
```JSON
"scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "next lint"
},
```

Then run `pnpm lint` in the terminal to install ESLint

#### Improving Form Accessibility
There are 3 main things we can do to improve form accessibility. 

- Semantic HTML: Using semantic elements `(<input>, <option>, etc)` instead of `<div>`. This allows assistive technologies (AT) to focus on the input elements and provide appropriate contextual information to the user, making the form easier to navigate and understand.
- Labelling: Including `<label>` and the htmlFor attribute ensures that each form field has a descriptive text label. This improves AT support by providing context and also enhances usability by allowing users to click on the label to focus on the corresponding input field.
- Focus Outline: The fields are properly styled to show an outline when they are in focus. This is critical for accessibility as it visually indicates the active element on the page, helping both keyboard and screen reader users to understand where they are on the form. You can verify this by pressing tab.

#### Server side form validation

We can use the `useActionState` React hook to update state based on a form action (such as form submission). (https://react.dev/reference/react/useActionState)

As such, `useActionState` can act as a middleware and perform server side form validation before the form data is actually submitted. 

In `app/ui/invoices/create-form.tsx`:
- We import the useActionState hook. 
- We initialize the hook, passing in the `createInvoice` function that will run when the form is submitted.
- The initial state is an object with 2 empty keys: message and errors.
- We replace the form action with hook action. 

```TSX
import { useActionState } from 'react';
 
export default function Form({ customers }: { customers: CustomerField[] }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);
 
  return <form action={formAction}>...</form>;
}
```

In `/app/lib/actions.ts` we use zod to define form validations in the schema. 

We also define the State which describes the datatypes of the error messages
```TSX
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
```

Use safeParse() to validate form data. It includes a built in try/catch block to handle parsing errors
```TSX
const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
```

If the form validation fails, return the error message so that we can display on page.
```TSX
// If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }
```

Back in the form `/app/ui/invoices/create-form.tsx` we use an aria to display the error for each field
```TSX
// Add aria-describedby to the select form field
        <select
          id="customer"
          name="customerId"
          className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          defaultValue=""
          aria-describedby="customer-error"
        >
          <option value="" disabled>
            Select a customer
          </option>
          {customers.map((name) => (
            <option key={name.id} value={name.id}>
              {name.name}
            </option>
          ))}
        </select>

// This div will display the error messages, if any
      <div id="customer-error" aria-live="polite" aria-atomic="true">
        {state.errors?.customerId &&
          state.errors.customerId.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>

```


## Authentication
We will use NextJS AuthJS to add authentication to our application. 
https://nextjs.authjs.dev 

Installation
```
pnpm i next-auth@beta
```

We generate a secret key for our application. This key is used to encrypt cookies. 
```
openssl rand -base64 32
```

In `.env` set the AUTH_SECRET= as the secret key value. Also remember to configure the environmental variables for our hosting provider (Vercel etc). 

At the root of the project we create `auth.config.ts`
```TS
import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
```

- We use the pages option to configure the custom sign-in, sign-out and error pages. 
- For the example above, our user will be redirected to our custom sign-in page at `/login` instead of the default page.
- Callbacks are a function that will check whether the user is authorized to access that route. 

Next, we create `middleware.ts` at the root of the project. We import the NextAuth AuthConfig. 

This allows us to create middleware that will run the callback function and check for authentication before render the pages.

The matcher allows us to filter which routes the middleware will run on.
```TS
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

We create a new file `auth.ts` 

- We specify the `Credentials` provider (Login with email and password). There are other types of providers (OAuth) that allow us to login with Google, Facebook etc.
- We define the `authorize` function to handle the authentication logic. This is a built-in function in NextJS AuthJS that expects a credential input and outputs the User object or null. 
  - We use Zod to validate the user email and password in the form. 
  - We call the `getUser` function to check whether the user exists in the database.
  - We use `bcrypt.compare` to check if the passwords match. Bear in mind that the passwords should be stored in salted form in the database. 
  - If the passwords match, return the user. 

In `app/lib/actions.ts` we create a new `authenticate` server action, importing the SignIn function from `auth.ts`

Lastly, we update the `app/ui/login-form.tsx` to use the `useActionState` hook to call the `authenticate` server action, and handle any form errors. 

#### Adding SignOut to the SideNav
In `/ui/dashboard/sidenav.tsx` we import the signOut function from `auth.js`

We attach it as a callback function in a from, and wrap it around a button. 

```TSX
import { signOut } from '@/auth';

        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
```

## Metadata
Metadata helps in enhancing SEO, improving accessibility and search rankings. 

This page describes the types of Metadata: 
https://nextjs.org/learn/dashboard-app/adding-metadata

NextJS can generate metadata dynamically in a `layout.ts` or `page.ts` file:
https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function

We can also define metadata using the following files:
- favicon.ico, apple-icon.jpg, and icon.jpg: Utilized for favicons and icons
- opengraph-image.jpg and twitter-image.jpg: Employed for social media images
- robots.txt: Provides instructions for search engine crawling
- sitemap.xml: Offers information about the website's structure

In `/app/layout.tsx` we import Metadata from Next and create a new Metadata object. This will be inherited by all pages that use it. 

Note that the  `%s` in the template will be replaced with the specific page title.

We can also define metadata for specific pages. This will override the metadata in the parent page. 

In `/app/dashboard/invoices/page.tsx` we update the page title
```TSX
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Invoices',
};
```
