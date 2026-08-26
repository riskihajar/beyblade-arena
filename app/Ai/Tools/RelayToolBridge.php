<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Prism\Prism\Contracts\Schema;
use Prism\Prism\Schema\ArraySchema;
use Prism\Prism\Schema\BooleanSchema;
use Prism\Prism\Schema\NumberSchema;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Tool as PrismTool;
use Stringable;

/**
 * Bridge that wraps a Prism Relay tool as a Laravel AI SDK tool.
 *
 * Relay::tools() returns Prism\Prism\Tool[], but ChatAgent.tools()
 * must return Laravel\Ai\Contracts\Tool[]. This bridge converts between them.
 */
class RelayToolBridge implements Tool
{
    public function __construct(
        protected PrismTool $prismTool,
    ) {}

    /**
     * Get the tool name for the AI SDK.
     */
    public function name(): string
    {
        return $this->prismTool->name();
    }

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return $this->prismTool->description();
    }

    /**
     * Execute the tool by delegating to the Prism tool's handler.
     *
     * Since we convert array/object schemas to string for OpenAI compatibility,
     * we need to parse JSON strings back to native types before forwarding.
     */
    public function handle(Request $request): Stringable|string
    {
        $args = $request->all();

        // Parse JSON string args back to native arrays/objects
        // This reverses our schema workaround (array/object → string for OpenAI)
        $args = $this->deserializeJsonArgs($args);

        try {
            return $this->prismTool->handle(...$args);
        } catch (\Throwable $e) {
            return 'Tool error: '.$e->getMessage();
        }
    }

    /**
     * Detect and parse JSON strings that should be arrays or objects.
     */
    protected function deserializeJsonArgs(array $args): array
    {
        foreach ($args as $key => $value) {
            if (is_string($value) && $value !== '') {
                $firstChar = $value[0];
                // Only attempt decode if it looks like JSON array or object
                if ($firstChar === '[' || $firstChar === '{') {
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $args[$key] = $decoded;
                    }
                }
            }
        }

        return $args;
    }

    /**
     * Get the tool's schema definition.
     *
     * Converts Prism Schema parameters into Laravel AI JsonSchema format.
     */
    public function schema(JsonSchema $schema): array
    {
        $parameters = $this->prismTool->parameters();
        $result = [];

        foreach ($parameters as $param) {
            $result[$param->name()] = $this->convertParameter($schema, $param);
        }

        return $result;
    }

    /**
     * Convert a Prism Schema parameter to a JsonSchema type.
     */
    protected function convertParameter(JsonSchema $schema, Schema $param): mixed
    {
        $type = $this->detectType($param);
        $description = property_exists($param, 'description') ? $param->description : '';

        $jsonParam = match ($type) {
            'integer' => $schema->integer()->description($description),
            'number' => $schema->number()->description($description),
            'boolean' => $schema->boolean()->description($description),
            // Array/object params → string (JSON) to avoid OpenAI schema validation
            // OpenAI requires array schemas to have 'items' which Relay may not provide
            'array' => $schema->string()->description($description.' (pass as JSON array string)'),
            'object' => $schema->string()->description($description.' (pass as JSON object string)'),
            default => $schema->string()->description($description),
        };

        if (in_array($param->name(), $this->prismTool->requiredParameters())) {
            $jsonParam = $jsonParam->required();
        }

        return $jsonParam;
    }

    /**
     * Detect the type of a Prism Schema parameter.
     */
    protected function detectType(Schema $param): string
    {
        return match (true) {
            $param instanceof NumberSchema => 'number',
            $param instanceof BooleanSchema => 'boolean',
            $param instanceof ArraySchema => 'array',
            $param instanceof ObjectSchema => 'object',
            default => 'string',
        };
    }
}
