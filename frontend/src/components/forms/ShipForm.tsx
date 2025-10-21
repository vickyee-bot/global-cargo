import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Ship, ShipFormData, ShipType, ShipStatus } from '@/types';

const shipFormSchema = z.object({
  name: z.string().min(1, 'Ship name is required').max(255, 'Name too long'),
  registration_number: z.string().min(1, 'Registration number is required').max(200, 'Registration number too long'),
  capacity_in_tonnes: z.number().min(0.1, 'Capacity must be greater than 0'),
  type: z.enum(['cargo_ship', 'passenger_ship', 'military_ship', 'icebreaker', 'fishing_vessel', 'barge_ship']).optional(),
  status: z.enum(['active', 'under_maintenance', 'decommissioned']).optional(),
});

interface ShipFormProps {
  ship?: Ship | null;
  onSubmit: (data: ShipFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit' | 'view';
}

const shipTypes: { value: ShipType; label: string }[] = [
  { value: 'cargo_ship', label: 'Cargo Ship' },
  { value: 'passenger_ship', label: 'Passenger Ship' },
  { value: 'military_ship', label: 'Military Ship' },
  { value: 'icebreaker', label: 'Icebreaker' },
  { value: 'fishing_vessel', label: 'Fishing Vessel' },
  { value: 'barge_ship', label: 'Barge Ship' },
];

const shipStatuses: { value: ShipStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'decommissioned', label: 'Decommissioned' },
];

export function ShipForm({ ship, onSubmit, onCancel, isLoading = false, mode }: ShipFormProps) {
  const form = useForm<ShipFormData>({
    resolver: zodResolver(shipFormSchema),
    defaultValues: {
      name: '',
      registration_number: '',
      capacity_in_tonnes: 0,
      type: 'cargo_ship',
      status: 'active',
    },
  });

  useEffect(() => {
    if (ship && (mode === 'edit' || mode === 'view')) {
      form.reset({
        name: ship.name,
        registration_number: ship.registrationNumber,
        capacity_in_tonnes: ship.capacityInTonnes || 0,
        type: ship.type,
        status: ship.status,
      });
    }
  }, [ship, mode, form]);

  const handleSubmit = (data: ShipFormData) => {
    onSubmit(data);
  };

  const isViewMode = mode === 'view';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ship Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter ship name"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter registration number"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="capacity_in_tonnes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (Tonnes) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Enter capacity in tonnes"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={isViewMode}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ship Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isViewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ship type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shipTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isViewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shipStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {!isViewMode && (
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Ship' : 'Update Ship'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
