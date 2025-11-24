/**
 * Component Examples and Usage Demos
 *
 * This file demonstrates how to use all common UI components.
 * Use these examples as reference when implementing features.
 */

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  Loading,
  Table,
  Input,
  Textarea,
  Badge,
  StatusBadge,
  Avatar,
  AvatarGroup,
} from './index';
import type { Column } from './Table';

// Example: Button Variants
export function ButtonExamples() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Buttons</h2>

      <div className="flex gap-2 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="success">Success</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <div className="flex gap-2">
        <Button isLoading={loading} onClick={() => setLoading(!loading)}>
          Toggle Loading
        </Button>
        <Button disabled>Disabled</Button>
      </div>

      <Button
        fullWidth
        leftIcon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        }
      >
        With Icon
      </Button>
    </div>
  );
}

// Example: Cards
export function CardExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Cards</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>This is a default card variant</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here with shadow.</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Bordered Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This card has a border instead of shadow.</p>
          </CardContent>
        </Card>

        <Card variant="elevated" hoverable>
          <CardHeader>
            <CardTitle>Elevated Hoverable</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hover over this card to see the effect.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Action</Button>
          </CardFooter>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Glass Effect</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card with glass morphism effect.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Example: Modal
export function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Modal</h2>

      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        description="This is a modal dialog example"
        size="md"
      >
        <div className="space-y-4">
          <p>Modal content goes here. You can put any components inside.</p>

          <Input label="Name" placeholder="Enter your name" />

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Example: Loading States
export function LoadingExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Loading Indicators</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-8">
            <Loading variant="spinner" size="md" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <Loading variant="dots" size="md" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <Loading variant="pulse" size="md" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <Loading variant="bars" size="md" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-8">
          <Loading variant="spinner" size="lg" text="Loading data..." />
        </CardContent>
      </Card>
    </div>
  );
}

// Example: Table
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

export function TableExample() {
  const data: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'pending' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'active' },
  ];

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      filterable: true,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => <Badge variant="purple">{value}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Table</h2>

      <Card>
        <CardHeader>
          <CardTitle>Users Table</CardTitle>
          <CardDescription>Sortable and filterable table example</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
            hoverable
            bordered
            onRowClick={(row) => alert(`Clicked: ${row.name}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Example: Form Inputs
export function InputExamples() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Form Inputs</h2>

      <Card>
        <CardHeader>
          <CardTitle>Registration Form</CardTitle>
          <CardDescription>Example form with validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Username"
              placeholder="Enter username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={errors.username}
              leftIcon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              }
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              helperText="We'll never share your email"
              variant="outlined"
              leftIcon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              }
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              variant="filled"
            />

            <Textarea
              label="Description"
              placeholder="Tell us about yourself"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />

            <Button fullWidth variant="primary">Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Example: Badges
export function BadgeExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Badges</h2>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Variants</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">With Dots</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="success" dot>Online</Badge>
                <Badge variant="error" dot>Offline</Badge>
                <Badge variant="warning" dot>Away</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Status Badges</h3>
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status="active" />
                <StatusBadge status="inactive" />
                <StatusBadge status="pending" />
                <StatusBadge status="success" />
                <StatusBadge status="failed" />
                <StatusBadge status="processing" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Sizes</h3>
              <div className="flex items-center gap-2">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Example: Avatars
export function AvatarExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Avatars</h2>

      <Card>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Sizes</h3>
              <div className="flex items-center gap-3">
                <Avatar name="John Doe" size="xs" />
                <Avatar name="Jane Smith" size="sm" />
                <Avatar name="Bob Johnson" size="md" />
                <Avatar name="Alice Brown" size="lg" />
                <Avatar name="Charlie Wilson" size="xl" />
                <Avatar name="Diana Prince" size="2xl" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">With Status</h3>
              <div className="flex items-center gap-3">
                <Avatar name="Online User" status="online" size="lg" />
                <Avatar name="Offline User" status="offline" size="lg" />
                <Avatar name="Away User" status="away" size="lg" />
                <Avatar name="Busy User" status="busy" size="lg" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Variants</h3>
              <div className="flex items-center gap-3">
                <Avatar name="Circle" variant="circle" size="lg" />
                <Avatar name="Square" variant="square" size="lg" />
                <Avatar name="Rounded" variant="rounded" size="lg" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Avatar Group</h3>
              <AvatarGroup max={4} size="md">
                <Avatar name="Alice Johnson" />
                <Avatar name="Bob Smith" />
                <Avatar name="Charlie Brown" />
                <Avatar name="Diana Prince" />
                <Avatar name="Ethan Hunt" />
                <Avatar name="Fiona Green" />
              </AvatarGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Complete Demo Page
export function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Sovren UI Components
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Production-ready, fully-typed React components
          </p>
        </div>

        <ButtonExamples />
        <CardExamples />
        <ModalExample />
        <LoadingExamples />
        <TableExample />
        <InputExamples />
        <BadgeExamples />
        <AvatarExamples />
      </div>
    </div>
  );
}
