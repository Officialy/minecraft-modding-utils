These are for converting old .java models to the modern .java model system

You'll need to alter the scripts slightly for your use cases, but it shouldn't be that complex.

# Troubleshooting
Make sure you remove any extra code outside the constructors as it may detect those with the regex.

Or at least make sure there are no clashing names as local variables.
You can remove the optional checker in the regex for "this." if you explicitly use that in your models.

# Command Syntax
`node utils.js updatemodel (input glob) (output location) [ignoreMissingParts (boolean)]`
