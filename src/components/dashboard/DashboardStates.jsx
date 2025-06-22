import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export const LoadingSkeletons = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="glassmorphic-card modern-border animate-pulse">
        <CardHeader>
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
        </CardFooter>
      </Card>
    ))}
  </div>
);

export const EmptyState = ({ isSearch, onNewLink }) => (
  <Card className="glassmorphic-card modern-border text-center py-12">
    <CardHeader>
      <CardTitle className="font-space-grotesk text-2xl">No Links Found</CardTitle>
      <CardDescription>
        {isSearch ? "No links match your search." : "You haven't created any links yet."}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button onClick={onNewLink} className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 text-white">
        <PlusCircle className="w-4 h-4 mr-2" /> Create Your First Link
      </Button>
    </CardContent>
  </Card>
);

export const AccessDeniedState = ({ onLogin }) => (
  <Card className="glassmorphic-card modern-border text-center py-12">
    <CardHeader>
        <CardTitle className="font-space-grotesk text-2xl">Access Denied</CardTitle>
        <CardDescription>Please log in to view your dashboard and manage your links.</CardDescription>
    </CardHeader>
    <CardContent>
        <Button onClick={onLogin}>
            Login / Sign Up
        </Button>
    </CardContent>
  </Card>
);