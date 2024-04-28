import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useToast } from "./ui/use-toast";

const playgroundSchema = z.object({
  template: z.union([z.literal("typescript"), z.literal("reactypescript")]),
  name: z.string(),
});

export function CreatePlayground() {
  const form = useForm<z.infer<typeof playgroundSchema>>({
    resolver: zodResolver(playgroundSchema),
  });
  const navigate = useNavigate({ from: "/" });
  const { toast } = useToast();

  const onSubmit = async (data: z.infer<typeof playgroundSchema>) => {
    const pgId = await createPlaygroundMutation.mutateAsync(data);
    // navigate({
    //   to: "/playground/$pgId",
    //   params: {
    //     pgId,
    //   },
    // });
    console.log(pgId);
  };

  const createPlaygroundMutation = useMutation({
    mutationFn: async (data: z.infer<typeof playgroundSchema>) => {
      const res = await fetch("http://localhost:3000/playgrounds/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Mutation failed");
      }

      const json = await res.json();
      if (!json.playgroundId) {
        throw new Error("Invalid api response");
      }

      return json.playgroundId as string;
    },
    onMutate: () => {
      toast({
        title: "Creating playground",
        description: "Waiting for your playground to be registered",
      });
    },
    onError: (e) => {
      console.log("error while creating pg");
      console.log(e);
      toast({
        title: "Error",
        description: "There was an unexpected error",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your playground has been created succesfuly",
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Playground</DialogTitle>
          <DialogDescription>
            Start your journey with our pre made templates
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select
                    disabled={createPlaygroundMutation.isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="typescript">Typescript</SelectItem>
                      <SelectItem value="reactypescript">
                        React + Typescript
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={createPlaygroundMutation.isPending}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="cool-project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createPlaygroundMutation.isPending}>
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
