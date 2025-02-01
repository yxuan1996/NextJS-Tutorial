import SideNav from '@/app/ui/dashboard/sidenav';
 
// We will apply the left side navbar to all pages in the /dashboard directory
// The Layout component takes in the children prop. 
// We define the type of the children prop as React.ReactNode. This means it can accept any valid react component, element or plain text.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}