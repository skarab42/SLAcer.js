<!DOCTYPE html>
<html lang="{{ lang }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ name }} ({{ codename }})</title>
        {{ styles }}
    </head>
    <body>
        <!-- {{ name }} ({{ codename}}) - v{{ version }} - {{ output_type }} -->
        <div id="straw">
            {{ view :app-main-tpl :remove }}
        </div>
        {{ scripts }}
        {{ views }}
        <!-- Initialization -->
        <script type="text/javascript">

        </script>
    </body>
</html>
