import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactMethod {
  type: string;
  value: string;
  icon: React.ReactNode;
  label: string;
  action?: () => void;
}

interface DonorContactCardProps {
  donor: {
    id: string;
    name: string;
    contactNumber?: string;
    email?: string;
    whatsapp?: string;
    facebook?: string;
    twitter?: string;
    preferred_contact_method?: string;
    emergency_contact?: string;
    emergency_contact_number?: string;
    bloodType?: string; // Optional blood type
  };
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export const DonorContactCard: React.FC<DonorContactCardProps> = ({
  donor,
  buttonText = "Contact",
  buttonVariant = "outline",
  buttonSize = "sm",
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
        toast({
          title: "Copied to clipboard",
          description: `${label} has been copied to your clipboard.`,
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const getContactMethods = (): ContactMethod[] => {
    const methods: ContactMethod[] = [];

    if (donor.contactNumber) {
      methods.push({
        type: "phone",
        value: donor.contactNumber,
        icon: <Phone className="h-4 w-4" />,
        label: "Phone",
        action: () => {
          window.location.href = `tel:${donor.contactNumber}`;
        },
      });
    }

    if (donor.email) {
      methods.push({
        type: "email",
        value: donor.email,
        icon: <Mail className="h-4 w-4" />,
        label: "Email",
        action: () => {
          window.location.href = `mailto:${donor.email}`;
        },
      });
    }

    if (donor.whatsapp) {
      methods.push({
        type: "whatsapp",
        value: donor.whatsapp,
        icon: <MessageSquare className="h-4 w-4" />,
        label: "WhatsApp",
        action: () => {
          window.open(`https://wa.me/${donor.whatsapp?.replace(/\+/g, "").replace(/\s/g, "")}`, "_blank");
        },
      });
    }

    if (donor.facebook) {
      methods.push({
        type: "facebook",
        value: donor.facebook,
        icon: <Facebook className="h-4 w-4" />,
        label: "Facebook",
        action: () => {
          window.open(donor.facebook, "_blank");
        },
      });
    }

    if (donor.twitter) {
      methods.push({
        type: "twitter",
        value: donor.twitter,
        icon: <Twitter className="h-4 w-4" />,
        label: "Twitter",
        action: () => {
          window.open(donor.twitter, "_blank");
        },
      });
    }

    return methods;
  };

  const contactMethods = getContactMethods();
  const preferredMethod = donor.preferred_contact_method || "Phone";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary text-white">
              <AvatarFallback>{getInitials(donor.name)}</AvatarFallback>
            </Avatar>
            <span>{donor.name}</span>
            {donor.bloodType && (
              <span className="ml-auto rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                {donor.bloodType}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Preferred contact method: <span className="font-medium">{preferredMethod}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {contactMethods.length > 0 ? (
            contactMethods.map((method) => (
              <div
                key={method.type}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  preferredMethod?.toLowerCase() === method.label.toLowerCase()
                    ? "border-primary/50 bg-primary/5"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-1.5">{method.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.value}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(method.value, method.label)}
                  >
                    {copied === method.label ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  {method.action && (
                    <Button variant="outline" size="sm" onClick={method.action}>
                      Contact
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No contact information</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  This donor does not have any contact information available.
                </p>
              </div>
            </div>
          )}

          {donor.emergency_contact && donor.emergency_contact_number && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">Emergency Contact</p>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{donor.emergency_contact}</p>
                  <p className="text-xs text-muted-foreground">{donor.emergency_contact_number}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = `tel:${donor.emergency_contact_number}`;
                  }}
                >
                  <Phone className="mr-1 h-3 w-3" />
                  Call
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogTrigger asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 