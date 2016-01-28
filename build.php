<?php
try
{
    // Start new buffer
    ob_start();

    // Include Toys autoloader
    require __DIR__.'/../Toys/builder/autoload.php';

    // Create the project builder instance
    $builder = new \Toys\Builder('./src', './dist');

    // Build and display the output
    $builder->build()->display();
}
catch (\Exception $e)
{
    // Get error message
    $message = $e->getMessage();

    // Format HTML output message
    $output  = "<html lang=\"en\"><head><meta charset=\"utf-8\">";
    $output .= "<title>Error !</title></head><body>";
    $output .= "<h1>Error !</h1><hr />";
    $output .= "<p>$message</p>\n";
    $output .= "</body></html>";

    // Clean old buffer
    ob_end_clean();

    // Print output
    echo $output;
}
