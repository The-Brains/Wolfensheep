define([
    'dok/utils',
], function(Utils) {

    /**
     *  CLASS DEFINITIONS
     */
    function ObjectPool(classObject) {
        this.pool = [];
        this.classObject = classObject;
    }
    ObjectPool.prototype.classObject = null;
    ObjectPool.prototype.pool = null;
    ObjectPool.prototype.index = 0;
    ObjectPool.prototype.create = create;
    ObjectPool.prototype.recycleAll = recycleAll;

    /**
     *  FUNCTION DEFINITIONS
     */
    function create() {
        if(this.index >= this.pool.length) {
            this.pool.push(new this.classObject());
        }
        return this.pool[this.index++];
    }

    function recycleAll() {
        this.index = 0;
    }

    function pool_create(classObject) {
        if(!classObject.pool) {
            classObject.pool = new ObjectPool(classObject);
        }
        return classObject.pool.create();
    }

    function pool_recycleAll(classObject) {
        if(classObject.pool) {
            classObject.pool.recycleAll();
        }
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    ObjectPool.create = pool_create;
    ObjectPool.recycleAll = pool_recycleAll;

    return ObjectPool;
});
