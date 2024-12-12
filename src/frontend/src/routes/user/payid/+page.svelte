<script lang="ts">
  import { Button } from "@components/ui/button";
  import { QrCode } from 'lucide-svelte';
</script>

<div class="grid grid-cols-2 gap-4">
  <a href="user/qrcode" class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground">
    <div class="flex w-[68px] flex-col items-center gap-2">
      <QrCode size={30} />
      <p class="text-center">QR Code</p>
    </div>
  </a>
  <Button variant="outline" class="h-12 truncate">
    Your Pay ID: nikhil2002
  </Button>
</div>