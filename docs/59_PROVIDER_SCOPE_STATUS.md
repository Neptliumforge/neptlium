# Provider Branch Validation Scope

This branch changes architecture documentation and adds additive API domain primitives/tests. It does not modify database schema, production secrets, provider credentials, deployed economic gates or existing provider execution adapters.

Required CI scope is therefore API typecheck/lint/test/build plus repository financial-authority regression gates and preview deployment validation.
