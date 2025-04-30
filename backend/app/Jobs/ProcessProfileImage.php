<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Intervention\Image\Facades\Image;

class ProcessProfileImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $imagePath;
    protected $userId;

    public function __construct($imagePath, $userId)
    {
        $this->imagePath = $imagePath;
        $this->userId = $userId;
    }

    public function handle()
    {
        // Process the image
        $image = Image::make(storage_path('app/public/' . $this->imagePath));
        
        // Resize the image
        $image->fit(300, 300);
        
        // Save the processed image
        $image->save(storage_path('app/public/' . $this->imagePath));
    }
}
