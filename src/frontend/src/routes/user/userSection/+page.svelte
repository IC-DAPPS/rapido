<script lang="ts">
  import { Button } from "@components/ui/button";
  import { Avatar, AvatarImage, AvatarFallback } from "@components/ui/avatar";

  export let users: { id: number; name: string; avatar: string; initial: string }[];
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold">People</h2>
  <div class="grid grid-cols-4 gap-x-8 gap-y-6">
    {#each users as user}
      <Button variant="ghost" class="flex h-auto flex-col items-center space-y-2 hover:bg-accent">
        <Avatar class="h-14 w-14">
          {#if user.avatar}
            <AvatarImage src={user.avatar} alt={user.name} />
          {:else}
            <AvatarFallback class="text-lg">{user.initial}</AvatarFallback>
          {/if}
        </Avatar>
        <span class="text-sm font-medium">{user.name}</span>
      </Button>
    {/each}
  </div>
</div>