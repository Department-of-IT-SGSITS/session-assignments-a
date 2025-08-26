
"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useToast } from "@/hooks/use-toast";
import type { LocationSettings as LocationSettingsType } from "@/types";
import { MapPin, RefreshCw } from "lucide-react";
import MapPicker from "@/components/map-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function LocationSettings() {
  const [location, setLocation] = useState<LocationSettingsType | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSettingsType | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocation = async () => {
      const docRef = doc(db, "settings", "location");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as LocationSettingsType;
        setLocation(data);
        setSelectedLocation(data);
      } else {
        const defaultLocation = {
          city: "Bhopal",
          lat: 23.2599,
          lon: 77.4126,
          displayName: "Bhopal, Madhya Pradesh, India",
        };
        setLocation(defaultLocation);
        setSelectedLocation(defaultLocation);
        await setDoc(docRef, defaultLocation);
      }
    };
    fetchLocation();
  }, []);

  const clearHistoricalData = async () => {
    const response = await fetch("/api/weather/clear", { method: "POST" });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to clear historical data.");
    }
    toast({
      title: "Historical Data Cleared",
      description: "Previous weather history has been removed.",
    });
  };

  const handleConfirmSave = async () => {
    if (!selectedLocation) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "location"), selectedLocation, {
        merge: true,
      });
      setLocation(selectedLocation);
      await clearHistoricalData();
      toast({
        title: "Success",
        description: "Location saved successfully.",
      });
      setIsMapOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save location.",
      });
      console.error("Error saving location:", error);
    } finally {
      setIsSaving(false);
      setIsAlertOpen(false);
    }
  };

  const handleLocationSelect = (newSelection: LocationSettingsType) => {
    setSelectedLocation(newSelection);
  };

  if (!location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading location settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Your currently selected location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">
              {location.displayName || `Lat: ${location.lat}, Lon: ${location.lon}`}
            </span>
          </div>

          {isMapOpen ? (
            <div className="space-y-4">
              <MapPicker
                onLocationSelect={handleLocationSelect}
                current_lat={location.lat}
                current_lon={location.lon}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAlertOpen(true)}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Save Location
                </Button>
                <Button
                  onClick={() => {
                    setIsMapOpen(false);
                    setSelectedLocation(location); // Reset selection
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsMapOpen(true)} className="w-full">
              Change Location
            </Button>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the location will clear all historical weather data for
              the previous location. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} disabled={isSaving}>
              {isSaving ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
