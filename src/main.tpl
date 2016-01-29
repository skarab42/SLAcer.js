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
        {{ view :appworkspace-main-tpl :remove }}
        {{ scripts }}
        {{ views }}
        <!-- Initialization -->
        <script type="text/javascript">
            ToysKernel.instance().setup({
                config: {{ config }},
                texts : {{ texts }},
            }).run({{ modules }});
        </script>
    </body>
</html>
