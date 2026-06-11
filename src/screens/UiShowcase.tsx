import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { Calendar } from '../components/ui/calendar';
import { Checkbox } from '../components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../components/ui/command';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '../components/ui/menubar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../components/ui/navigation-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Progress } from '../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Toggle } from '../components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../components/ui/sidebar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
  Heart, 
  Settings, 
  User, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  Check, 
  Bell, 
  Calendar as CalendarIcon,
  Bold, 
  Italic, 
  Underline,
  Share2,
  FileText,
  Trash2,
  Plus
} from 'lucide-react';

const chartData = [
  { month: "January", patients: 186, staff: 80 },
  { month: "February", patients: 305, staff: 200 },
  { month: "March", patients: 237, staff: 120 },
  { month: "April", patients: 73, staff: 190 },
  { month: "May", patients: 209, staff: 130 },
  { month: "June", patients: 214, staff: 140 },
];

const chartConfig = {
  patients: {
    label: "Patients Served",
    color: "var(--brand-500)",
  },
  staff: {
    label: "Active Staff",
    color: "var(--teal-500)",
  },
};

export function UiShowcase() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [progressVal, setProgressVal] = useState(60);
  const [sliderVal, setSliderVal] = useState([50]);
  const [otpVal, setOtpVal] = useState('');
  const [switchVal, setSwitchVal] = useState(true);
  const [checkboxVal, setCheckboxVal] = useState<boolean | 'indeterminate'>(true);

  const categories = [
    { id: 'buttons', name: 'Buttons & Badges' },
    { id: 'forms', name: 'Forms & Inputs' },
    { id: 'feedback', name: 'Feedback & Dialogs' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'data', name: 'Data & Structure' },
    { id: 'interactive', name: 'Interactive & Chart' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--neutral-50)] text-[var(--neutral-900)] font-sans">
      {/* Table of contents sidebar */}
      <aside className="w-64 border-r border-[var(--neutral-200)] bg-white p-6 sticky top-0 h-screen hidden md:block shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[var(--brand-500)] text-white rounded-lg">
            <Heart size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-[var(--brand-900)] uppercase">OPD System</h2>
            <p className="text-xs text-[var(--neutral-400)]">UI Component Library</p>
          </div>
        </div>

        <nav className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === category.id
                  ? 'bg-[var(--brand-50)] text-[var(--brand-700)]'
                  : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'
              }`}
            >
              <span>{category.name}</span>
              {activeTab === category.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--brand-900)]">UI Showcase</h1>
              <p className="text-[var(--neutral-500)] mt-1">
                Explore, test, and copy interactive previews of all system components.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="line" onClick={() => toast.info('System components synchronized!')}>
                <Settings size={16} />
                Sync Status
              </Button>
            </div>
          </div>
          <Separator className="mt-6" />
        </header>

        {/* Dynamic Category Sections */}
        <div className="space-y-10">

          {/* BUTTONS & BADGES */}
          {activeTab === 'buttons' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Buttons & Badges</h2>
                <Badge variant="active">Core UI</Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Button Variants Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Button Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default</Button>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="line">Line Border</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link Style</Button>
                  </div>
                </Card>

                {/* Button Sizes Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Button Sizes & Icons</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm" variant="primary">Small</Button>
                    <Button size="default" variant="primary">Default</Button>
                    <Button size="lg" variant="primary">Large</Button>
                    <Button size="icon" variant="outline"><Heart size={16} /></Button>
                    <Button variant="default">
                      <Heart size={16} />
                      With Icon
                    </Button>
                  </div>
                </Card>

                {/* Badges Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Status Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="new">new</Badge>
                    <Badge variant="returning">returning</Badge>
                    <Badge variant="on-duty">on-duty</Badge>
                    <Badge variant="off-duty">off-duty</Badge>
                    <Badge variant="waiting">waiting</Badge>
                    <Badge variant="active">active</Badge>
                    <Badge variant="done">done</Badge>
                    <Badge variant="skipped">skipped</Badge>
                    <Badge variant="urgent">urgent</Badge>
                  </div>
                </Card>

                {/* Toggle & Toggle Group Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Toggle & Toggle Group</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Toggle aria-label="Toggle heart">
                        <Heart size={16} />
                      </Toggle>
                      <span className="text-xs text-[var(--neutral-500)]">Single Toggle State</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ToggleGroup type="multiple">
                        <ToggleGroupItem value="bold" aria-label="Toggle bold">
                          <Bold size={16} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="italic" aria-label="Toggle italic">
                          <Italic size={16} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="underline" aria-label="Toggle underline">
                          <Underline size={16} />
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <span className="text-xs text-[var(--neutral-500)]">Toggle Group</span>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* FORMS & INPUTS */}
          {activeTab === 'forms' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Forms & Inputs</h2>
                <Badge variant="active">Interactive</Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Standard Inputs & Textarea */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider">Text Fields</h3>
                  <div className="space-y-2">
                    <Label htmlFor="input-showcase">Full Name</Label>
                    <Input id="input-showcase" placeholder="Dr. Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textarea-showcase">Clinical Observations</Label>
                    <Textarea id="textarea-showcase" placeholder="Describe symptoms, medical history..." />
                  </div>
                </Card>

                {/* Select & Switch & Checkbox */}
                <Card className="p-6 space-y-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider">Selection Controls</h3>
                  <div className="space-y-2">
                    <Label>Specialty Department</Label>
                    <Select defaultValue="cardiology">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="switch-showcase">Notify Patient via SMS</Label>
                      <p className="text-xs text-[var(--neutral-500)]">Send token status updates automatically.</p>
                    </div>
                    <Switch id="switch-showcase" checked={switchVal} onCheckedChange={setSwitchVal} />
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox id="check-showcase" checked={checkboxVal} onCheckedChange={setCheckboxVal} />
                    <Label htmlFor="check-showcase" className="text-sm font-normal">Accept Terms & Conditions</Label>
                  </div>
                </Card>

                {/* Slider & Radio Group */}
                <Card className="p-6 space-y-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider">Numerical & Multi-choice</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Priority Level</Label>
                      <span className="text-xs font-bold text-[var(--brand-500)]">{sliderVal}%</span>
                    </div>
                    <Slider value={sliderVal} onValueChange={setSliderVal} max={100} step={1} />
                  </div>

                  <div className="space-y-2">
                    <Label>Billing Method</Label>
                    <RadioGroup defaultValue="cash">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="r1" />
                        <Label htmlFor="r1" className="text-sm font-normal">Cash</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="r2" />
                        <Label htmlFor="r2" className="text-sm font-normal">Credit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="insurance" id="r3" />
                        <Label htmlFor="r3" className="text-sm font-normal">Health Insurance</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </Card>

                {/* Input OTP */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider">One-Time Password (OTP) Input</h3>
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <InputOTP maxLength={6} value={otpVal} onChange={setOtpVal}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-xs text-[var(--neutral-500)] mt-2">Enter 6-digit confirmation code.</p>
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* FEEDBACK & DIALOGS */}
          {activeTab === 'feedback' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Feedback, Alerts & Dialogs</h2>
                <Badge variant="active">Overlays</Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Sonner Toast Triggers */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Sonner Toasts</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => toast('Simple message')}>Toast Standard</Button>
                    <Button variant="primary" onClick={() => toast.success('Patient record saved successfully!')}>Toast Success</Button>
                    <Button variant="destructive" onClick={() => toast.error('Failed to connect to billing database.')}>Toast Error</Button>
                    <Button variant="secondary" onClick={() => toast.info('Next patient in queue: Alice Cooper.')}>Toast Info</Button>
                  </div>
                </Card>

                {/* Dialogs triggers */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider">Dialog / Popover Popups</h3>
                  <div className="flex flex-wrap gap-3">
                    {/* Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Open Dialog</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Prescription</DialogTitle>
                          <DialogDescription>Create a medication plan for this patient.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-4">
                          <Label>Medication Name</Label>
                          <Input placeholder="Amoxicillin 500mg" />
                        </div>
                        <DialogFooter>
                          <Button variant="primary">Add Prescription</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* AlertDialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Open Alert Dialog</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the selected clinical report permanently. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-[var(--error-500)] text-white hover:bg-[var(--error-700)]">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="line">Open Popover</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Dimensions</h4>
                            <p className="text-sm text-muted-foreground">Set the width & margin.</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </Card>

                {/* Drawer & Sheet */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Drawer & Sheet</h3>
                  <div className="flex gap-3">
                    {/* Sheet */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">Open Sheet (Right)</Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Patient Context</SheetTitle>
                          <SheetDescription>Complete overview of patient metrics.</SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-4">
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">Blood Pressure</span>
                            <span className="text-[var(--neutral-600)]">120/80 mmHg</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">Pulse Rate</span>
                            <span className="text-[var(--neutral-600)]">72 bpm</span>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    {/* Drawer */}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline">Open Drawer (Bottom)</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-sm">
                          <DrawerHeader>
                            <DrawerTitle>Active Diagnostics</DrawerTitle>
                            <DrawerDescription>View laboratory status reports.</DrawerDescription>
                          </DrawerHeader>
                          <div className="p-4 pb-0">
                            <p className="text-sm text-[var(--neutral-500)]">All telemetry results synchronized.</p>
                          </div>
                          <DrawerFooter>
                            <Button>Download PDF</Button>
                            <DrawerClose asChild>
                              <Button variant="outline">Close</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </Card>

                {/* Alerts */}
                <div className="space-y-4">
                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Attention Required</AlertTitle>
                    <AlertDescription>
                      You have 3 patients waiting in the cardiology queue.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-[var(--error-200)] bg-[var(--error-50)] text-[var(--error-700)]">
                    <AlertTitle>Critical Alert</AlertTitle>
                    <AlertDescription>
                      Heart rate sensor data is showing abnormal readings.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Tooltip & HoverCard */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Tooltip & HoverCard</h3>
                  <div className="flex gap-6 items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline">Hover for Tooltip</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clicking this saves data immediately.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="text-[var(--brand-500)] font-semibold underline cursor-pointer">@JaneDoe</span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Dr. Jane Doe</h4>
                            <p className="text-xs text-[var(--neutral-500)]">Chief of Cardiology Department</p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </Card>

                {/* Progress & Skeleton */}
                <Card className="p-6 space-y-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider">Progress & Skeleton</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Loading Patient Registry</span>
                      <span>{progressVal}%</span>
                    </div>
                    <Progress value={progressVal} />
                    <Button size="sm" variant="line" onClick={() => setProgressVal(prev => (prev >= 100 ? 10 : prev + 20))}>
                      Increase Progress
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* NAVIGATION */}
          {activeTab === 'navigation' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Navigation Elements</h2>
                <Badge variant="active">Structure</Badge>
              </div>

              <div className="space-y-6">
                {/* Breadcrumbs Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Breadcrumb Trails</h3>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/patients">Patients</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Create Entry</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </Card>

                {/* Dropdowns, Menubars & Context Menu */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider">Menus & Dropdowns</h3>
                    <div className="flex flex-wrap gap-4">
                      {/* DropdownMenu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">Actions Dropdown</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Manage Records</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast.success('Shared!')}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Patient File
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success('Report exported!')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Archive Patient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Menubar */}
                      <Menubar>
                        <MenubarMenu>
                          <MenubarTrigger>File</MenubarTrigger>
                          <MenubarContent>
                            <MenubarItem>New Registry <span className="ml-auto text-xs text-muted-foreground">⌘N</span></MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Print Receipt</MenubarItem>
                          </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                          <MenubarTrigger>Edit</MenubarTrigger>
                          <MenubarContent>
                            <MenubarItem>Undo</MenubarItem>
                            <MenubarItem>Redo</MenubarItem>
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                    </div>
                  </Card>

                  {/* ContextMenu */}
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Context Menu</h3>
                    <ContextMenu>
                      <ContextMenuTrigger className="flex h-[120px] w-full items-center justify-center rounded-md border border-dashed border-[var(--neutral-300)] text-sm text-[var(--neutral-500)]">
                        Right click here to open menu
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64">
                        <ContextMenuLabel>Patient Options</ContextMenuLabel>
                        <ContextMenuSeparator />
                        <ContextMenuItem>Print Prescription</ContextMenuItem>
                        <ContextMenuItem>Assign Doctor</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem>Close Case File</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </Card>
                </div>

                {/* Navigation Menu */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Navigation Menu Strip</h3>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Consultations</NavigationMenuTrigger>
                        <NavigationMenuContent className="p-4 w-80 space-y-2">
                          <h4 className="font-bold text-sm">Doctor Consultation Management</h4>
                          <p className="text-xs text-[var(--neutral-500)]">Schedule new consultations and manage token queues dynamically.</p>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Diagnostic Reports</NavigationMenuTrigger>
                        <NavigationMenuContent className="p-4 w-80">
                          <p className="text-xs">Browse lab reports, ECGs, blood analysis results, and X-ray queues.</p>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </Card>

                {/* Pagination */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Pagination</h3>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </Card>
              </div>
            </section>
          )}

          {/* DATA & STRUCTURE */}
          {activeTab === 'data' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Data & Structure</h2>
                <Badge variant="active">Layouts</Badge>
              </div>

              <div className="space-y-6">
                {/* Tables & Accordions */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Table */}
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Patient Table</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-[var(--neutral-100)]">
                          <TableRow>
                            <TableHead>Patient ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">#1002</TableCell>
                            <TableCell>Alice Smith</TableCell>
                            <TableCell><Badge variant="waiting">waiting</Badge></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">#1003</TableCell>
                            <TableCell>Bob Johnson</TableCell>
                            <TableCell><Badge variant="done">done</Badge></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">#1004</TableCell>
                            <TableCell>Charlie Davis</TableCell>
                            <TableCell><Badge variant="urgent">urgent</Badge></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Card>

                  {/* Accordion */}
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Accordion FAQ</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Is the OPD system accessible offline?</AccordionTrigger>
                        <AccordionContent>
                          Yes, patient records are cached locally and synchronized once internet connection is restored.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>How are tokens allocated?</AccordionTrigger>
                        <AccordionContent>
                          Tokens are assigned sequentially based on priority queue factors and registration timestamps.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                </div>

                {/* Tabs, AspectRatio & Separator */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Sub-Tabs Panel</h3>
                    <Tabs defaultValue="clinical">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="clinical">Clinical Data</TabsTrigger>
                        <TabsTrigger value="billing">Billing Info</TabsTrigger>
                      </TabsList>
                      <TabsContent value="clinical" className="p-4 bg-[var(--neutral-50)] rounded-md border mt-2">
                        <p className="text-sm text-[var(--neutral-600)]">Clinical vitals, prescriptions, and symptoms history details.</p>
                      </TabsContent>
                      <TabsContent value="billing" className="p-4 bg-[var(--neutral-50)] rounded-md border mt-2">
                        <p className="text-sm text-[var(--neutral-600)]">Invoice status, insurance claims, and outstanding payments information.</p>
                      </TabsContent>
                    </Tabs>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Aspect Ratio Image Previews</h3>
                    <div className="w-[300px]">
                      <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden flex items-center justify-center border">
                        <img
                          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=60"
                          alt="Hospital Showcase"
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                    </div>
                  </Card>
                </div>

                {/* Collapsible */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Collapsible Area</h3>
                  <Collapsible className="space-y-2">
                    <div className="flex items-center justify-between space-x-4 px-4 py-2 bg-[var(--neutral-100)] rounded-lg">
                      <h4 className="text-sm font-semibold">Toggle to view advanced metadata settings</h4>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">Show</Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="space-y-2 px-4 py-3 bg-white border rounded-lg">
                      <div className="text-xs text-[var(--neutral-500)] space-y-1">
                        <p>Database Node ID: <code>US-EAST-01-A</code></p>
                        <p>Websocket Port: <code>8081</code></p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Resizable Panel Layout */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Resizable Layout Splits</h3>
                  <div className="border rounded-lg h-[200px] bg-[var(--neutral-50)]">
                    <ResizablePanelGroup direction="horizontal">
                      <ResizablePanel defaultSize={30} minSize={20}>
                        <div className="flex h-full items-center justify-center p-6 bg-white">
                          <span className="font-semibold text-xs text-muted-foreground">List View</span>
                        </div>
                      </ResizablePanel>
                      <ResizableHandle />
                      <ResizablePanel defaultSize={70}>
                        <div className="flex h-full items-center justify-center p-6 bg-[var(--neutral-50)]">
                          <span className="font-semibold text-xs text-muted-foreground">Detail View Panel</span>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                </Card>

                {/* Scroll Area Showcase */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Scroll Area</h3>
                  <ScrollArea className="h-[150px] w-full rounded-md border p-4 bg-white">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Recent Logs</h4>
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="text-xs border-b pb-1 text-[var(--neutral-500)]">
                          Log #{1000 - i}: Patient check-in updated in cardiology department database.
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </section>
          )}

          {/* INTERACTIVE & ADVANCED */}
          {activeTab === 'interactive' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Interactive & Advanced Elements</h2>
                <Badge variant="active">Features</Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Recharts Chart inside ChartContainer */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Chart Trends Preview</h3>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--teal-500)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--teal-500)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="patients" stroke="var(--brand-500)" fillOpacity={1} fill="url(#colorPatients)" />
                      <Area type="monotone" dataKey="staff" stroke="var(--teal-500)" fillOpacity={1} fill="url(#colorStaff)" />
                    </AreaChart>
                  </ChartContainer>
                </Card>

                {/* Calendar Date Picker */}
                <Card className="p-6 flex flex-col items-center">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4 self-start">Calendar Picker</h3>
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={setCalendarDate}
                    className="rounded-md border shadow-xs"
                  />
                  {calendarDate && (
                    <p className="text-xs text-[var(--neutral-500)] mt-3">Selected Date: {calendarDate.toDateString()}</p>
                  )}
                </Card>

                {/* Embla Carousel */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Slide Carousel</h3>
                  <div className="px-10">
                    <Carousel className="w-full max-w-xs mx-auto">
                      <CarouselContent>
                        <CarouselItem>
                          <div className="p-1">
                            <Card className="flex aspect-square items-center justify-center p-6 bg-[var(--brand-50)] border-[var(--brand-100)]">
                              <span className="text-sm font-semibold text-[var(--brand-700)]">Slide 1: Patient Care</span>
                            </Card>
                          </div>
                        </CarouselItem>
                        <CarouselItem>
                          <div className="p-1">
                            <Card className="flex aspect-square items-center justify-center p-6 bg-[var(--teal-50)] border-[var(--teal-100)]">
                              <span className="text-sm font-semibold text-[var(--teal-700)]">Slide 2: Lab Services</span>
                            </Card>
                          </div>
                        </CarouselItem>
                        <CarouselItem>
                          <div className="p-1">
                            <Card className="flex aspect-square items-center justify-center p-6 bg-[var(--success-50)] border-[var(--success-100)]">
                              <span className="text-sm font-semibold text-[var(--success-700)]">Slide 3: Pharmacy Stock</span>
                            </Card>
                          </div>
                        </CarouselItem>
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                </Card>

                {/* Sidebar Component Showcase (rendered embedded) */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Embedded Sidebar Component</h3>
                  <div className="border rounded-lg overflow-hidden h-[300px]">
                    <SidebarProvider defaultOpen={true}>
                      <div className="flex h-full w-full">
                        <Sidebar collapsible="none" className="w-48 bg-white border-r">
                          <SidebarContent>
                            <SidebarGroup>
                              <SidebarGroupLabel>Menu Preview</SidebarGroupLabel>
                              <SidebarGroupContent>
                                <SidebarMenu>
                                  <SidebarMenuItem>
                                    <SidebarMenuButton isActive>
                                      <User size={16} />
                                      <span>Registry</span>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                  <SidebarMenuItem>
                                    <SidebarMenuButton>
                                      <Settings size={16} />
                                      <span>Configuration</span>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                </SidebarMenu>
                              </SidebarGroupContent>
                            </SidebarGroup>
                          </SidebarContent>
                        </Sidebar>
                        <div className="flex-1 p-6 bg-[var(--neutral-50)] text-xs flex items-center justify-center">
                          Sidebar Context Area
                        </div>
                      </div>
                    </SidebarProvider>
                  </div>
                </Card>

                {/* Command Palette Mock */}
                <Card className="p-6 col-span-1 md:col-span-2">
                  <h3 className="text-sm font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-4">Command Search Panel</h3>
                  <div className="border rounded-lg overflow-hidden bg-white max-w-md mx-auto">
                    <Command>
                      <CommandInput placeholder="Search patients or type a command..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                          <CommandItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Alice Smith (Patient #1002)</span>
                          </CommandItem>
                          <CommandItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Bob Johnson (Patient #1003)</span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                </Card>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
